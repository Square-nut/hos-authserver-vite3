import tryGetOnlyArray from './try-get-only-array';
import tryGetPaginationParams from './try-get-pagination-params';
import {
	isArray,
	isObject,
	isFunction,
	isString,
	isPromise,
} from '../get-type';

const getValue = (o: unknown, k: string): unknown => {
	let cur: unknown = o;
	k.split('.').forEach((v) => {
		if (cur !== null && typeof cur === 'object' && v in cur) {
			cur = (cur as Record<string, unknown>)[v];
		}
	});
	return cur;
};

type ParseRuleFn = (
	resolve: (v: unknown) => void,
	reject: (r: unknown) => void,
	data: unknown,
	field: unknown,
) => void;

const parseRules = {
	default(resolve, reject, data, field) {
		resolve(field ? getValue(data, String(field)) : data);
	},
	array(resolve, reject, data, field) {
		let result: unknown;
		if (isArray(data)) {
			resolve(data);
		} else if (isObject(data)) {
			result = field
				? getValue(data, String(field))
				: tryGetOnlyArray(data).data;

			if (isString(result)) {
				try {
					result = JSON.parse(result);
				} catch {
					/* ignore */
				}
			}

			if (isArray(result)) {
				resolve(result);
			} else {
				reject('type error');
			}
		} else {
			reject('type error');
		}
	},
	table(resolve, reject, data, field) {
		let listField: unknown;
		let totalField: unknown;

		if (isObject(field)) {
			const f = field as Record<string, unknown>;
			listField = f.list;
			totalField = f.total;
		} else {
			listField = field;
		}

		const arrayRule = parseRules.array;
		arrayRule(
			(array: unknown) => {
				resolve({
					list: array,
					total: totalField
						? getValue(data, String(totalField))
						: tryGetPaginationParams(data).total,
				});
			},
			reject,
			data,
			listField,
		);
	},
} satisfies Record<string, ParseRuleFn>;

type ApiFn = (
	url: string,
	params?: Record<string, string | undefined>,
) => Promise<unknown>;

export default function tryParseCommonData(
	data: unknown,
	rule: string | undefined,
	api: ApiFn,
): Promise<unknown> | undefined {
	if (!rule) return undefined;
	return new Promise((resolve, reject) => {
		const ruleKey = rule.toLowerCase() as keyof typeof parseRules;
		const parseRule: ParseRuleFn =
			parseRules[ruleKey] ?? parseRules.default;

		let field: unknown;
		let promise: Promise<unknown> | undefined;

		let d = data;
		if (isFunction(d)) {
			d = (d as () => unknown)();
		}

		if (isString(d)) {
			let s: string = d;
			const r = /(?:\()(.+)(?:\))/.exec(s);
			if (r && r.length >= 2) {
				s = s.replace(r[0]!, '');
				field = r[1];
			}

			const params: Record<string, string | undefined> = {};
			const tmpArr = s.split('?');
			if (tmpArr.length >= 2) {
				s = tmpArr[0]!;
				tmpArr[1]!.split('&').forEach((part: string) => {
					const parts = part.split('=');
					params[parts[0]!] = parts[1];
				});
			}
			promise = api(s, params);
		}

		if (isPromise(d)) {
			promise = d;
		}

		if (isObject(d)) {
			const obj = d as Record<string, unknown>;
			const request = obj.data ?? obj.url ?? obj.api;
			field = obj.field;
			if (isPromise(request)) {
				promise = request as Promise<unknown>;
			}
			if (isString(request)) {
				promise = api(
					(obj.api ?? obj.url) as string,
					obj.params as Record<string, string | undefined> | undefined,
				);
			}
		}

		if (promise) {
			promise.then(
				(response) => {
					parseRule(resolve, reject, response, field);
				},
				(err) => {
					reject(err);
				},
			);
		} else {
			parseRule(resolve, reject, d, field);
		}
	});
}
