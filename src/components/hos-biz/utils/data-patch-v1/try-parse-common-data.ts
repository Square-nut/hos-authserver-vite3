/* eslint-disable */
/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 11:10:00
 */

import tryGetOnlyArray from './try-get-only-array';
import tryGetPaginationParams from './try-get-pagination-params';
import {
	isArray,
	isObject,
	isFunction,
	isString,
	isPromise,
} from '../get-type';

type ParseRule = (
	resolve: (value: unknown) => void,
	reject: (reason?: unknown) => void,
	data: unknown,
	field?: unknown,
) => void;

type ApiFn = (url: string, params?: Record<string, unknown>) => Promise<unknown>;

const getValue = (o: Record<string, unknown>, k: string): unknown => {
	let current: unknown = o;
	k.split('.').forEach((v) => {
		current = (current as Record<string, unknown>)[v];
	});
	return current;
};

const parseRules: Record<string, ParseRule> = {
	default(resolve, _reject, data, field) {
		resolve(field ? getValue(data as Record<string, unknown>, field as string) : data);
	},
	array(resolve, reject, data, field) {
		let result: unknown;
		if (isArray(data)) {
			resolve(data);
		} else if (isObject(data)) {
			result = field ? getValue(data, field as string) : tryGetOnlyArray(data).data;

			if (isString(result)) {
				try {
					result = JSON.parse(result);
				} catch {
					/* ignore parse error */
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
			listField = field.list;
			totalField = field.total;
		} else {
			listField = field;
		}

		parseRules.array!(
			(array) => {
				resolve({
					list: array,
					total: totalField
						? getValue(data as Record<string, unknown>, totalField as string)
						: tryGetPaginationParams(data).total,
				});
			},
			reject,
			data,
			listField,
		);
	},
};

export default (data: unknown, rule: string | undefined, api: ApiFn) => {
	if (rule)
		return new Promise((resolve, reject) => {
			const parseRule = parseRules[rule.toLocaleLowerCase()] || parseRules.default!;

			let field: unknown;
			let promise: Promise<unknown> | undefined;

			if (isFunction(data)) {
				data = data();
			}

			if (isString(data)) {
				let dataStr = data;
				const r = /(?:\()(.+)(?:\))/.exec(dataStr);
				if (r && r.length >= 2) {
					dataStr = dataStr.replace(r[0], '');
					field = r[1];
				}

				const params: Record<string, string> = {};
				const tmpArr = dataStr.split('?');
				if (tmpArr.length >= 2) {
					const url = tmpArr[0]!;
					tmpArr[1]!.split('&').forEach((part: string) => {
						const parts = part.split('=');
						params[parts[0]!] = parts[1]!;
					});
					promise = api(url, params);
				} else {
					promise = api(dataStr, params);
				}
			}

			if (isPromise(data)) {
				promise = data;
			}

			if (isObject(data)) {
				const request = data.data || data.url || data.api;
				field = data.field;
				if (isPromise(request)) {
					promise = request as Promise<unknown>;
				}
				if (isString(request)) {
					promise = api((data.api || data.url) as string, data.params as Record<string, unknown>);
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
				parseRule(resolve, reject, data, field);
			}
		});
};
/* eslint-disable */
