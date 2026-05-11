import { isArray, isFunction, isObject, isString } from '../get-type';

const keys = ['list', 'data'];

/** Shared shape for heuristic guess helpers (list array / pagination total). */
export interface GuessResult {
	matched: Record<string, number>;
	path: string;
	error: boolean;
	data?: unknown;
	total?: unknown;
}

export const addMatchedPath = (
	result: GuessResult,
	key: string,
	basePath: string,
): void => {
	const pi = basePath ? basePath + '.' + key : key;
	if (result.matched.hasOwnProperty(pi)) {
		result.matched[pi] = (result.matched[pi] ?? 0) + 1;
	} else {
		result.matched[pi] = 1;
	}
};

export const getDataByImportance = (
	data: unknown,
	result: GuessResult,
	field: 'data' | 'total',
): void => {
	const { matched } = result;

	const path = Object.keys(matched).sort((a, b) => matched[b]! - matched[a]!)[0];

	if (path) {
		let tmp: unknown = data;
		path.split('.').forEach((v) => {
			if (tmp !== null && typeof tmp === 'object' && v in tmp) {
				tmp = (tmp as Record<string, unknown>)[v];
			}
		});
		result.path = path;
		result[field] = tmp;
	} else {
		result.error = true;
	}
};

function getArrayFromJSON(
	json: Record<string, unknown>,
	result: GuessResult,
	basePath = '',
): void {
	const tmpArray: unknown[] = [];
	const tmpJSON: Record<string, unknown>[] = [];
	const tmpArrayPath: string[] = [];
	const tmpJSONPath: string[] = [];
	let i: number;
	let l: number;
	let key: string;

	for (i = 0, l = keys.length; i < l; i++) {
		key = keys[i]!;
		if (Array.isArray(json[key])) {
			addMatchedPath(result, key, basePath);
		}
	}

	Object.keys(json).forEach((k) => {
		const v = json[k];
		if (isArray(v)) {
			addMatchedPath(result, k, basePath);
			tmpArrayPath.push(k);
			tmpArray.push(v);
		}
		if (isObject(v)) {
			tmpJSONPath.push(k);
			tmpJSON.push(v as Record<string, unknown>);
		}
	});

	if (tmpArray.length === 1) {
		addMatchedPath(result, tmpArrayPath[0]!, basePath);
	}

	if (tmpArray.length > 1) {
		for (i = 0, l = keys.length; i < l; i++) {
			key = keys[i]!;
			for (let j = 0; j < tmpArray.length; j++) {
				if (tmpArrayPath[j]!.includes(key)) {
					addMatchedPath(result, tmpArrayPath[j]!, basePath);
				}
			}
		}
	}

	for (const x in tmpJSON) {
		getArrayFromJSON(
			tmpJSON[x]!,
			result,
			basePath ? basePath + '.' + tmpJSONPath[x]! : tmpJSONPath[x]!,
		);
		return;
	}
}

export default (data: unknown): GuessResult & { data: unknown[] } => {
	const result: GuessResult & { data: unknown[] } = {
		data: [],
		matched: {},
		path: '',
		error: false,
	};
	if (isArray(data)) {
		result.data = data;
		return result;
	}
	let current = data;
	if (isFunction(data)) {
		current = data();
	}
	if (isString(current)) {
		try {
			current = JSON.parse(current) as unknown;
		} catch {
			result.error = true;
			return result;
		}
	}
	if (isObject(current)) {
		getArrayFromJSON(current as Record<string, unknown>, result);
	}

	getDataByImportance(current, result, 'data');

	return result;
};
