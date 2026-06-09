/* eslint-disable */
/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 11:09:53
 */

import { isArray, isFunction, isObject, isString } from '../get-type';

const keys = ['list', 'data'];

export interface PatchBaseResult {
	data?: unknown[];
	total?: number;
	matched: Record<string, number>;
	path: string;
	error: boolean;
}

export interface PatchMatchResult extends PatchBaseResult {
	data: unknown[];
}

export const addMatchedPath = (result: PatchBaseResult, key: string, basePath: string) => {
	const pi = basePath ? basePath + '.' + key : key;
	result.matched.hasOwnProperty(pi) ? result.matched[pi]!++ : (result.matched[pi] = 1);
};

export const getDataByImportance = (data: unknown, result: PatchBaseResult, field: 'data' | 'total') => {
	const { matched } = result;

	const path = Object.keys(matched).sort((a, b) => matched[b]! - matched[a]!)[0];

	if (path) {
		let tmp: unknown = data;
		path.split('.').forEach((v) => {
			tmp = (tmp as Record<string, unknown>)[v];
		});
		result.path = path;
		result[field] = tmp as never;
	} else {
		result.error = true;
	}
};

function getArrayFromJSON(
	json: Record<string, unknown>,
	result: PatchMatchResult,
	basePath = '',
): void {
	const tmpArray: unknown[][] = [];
	const tmpJSON: Record<string, unknown>[] = [];
	const tmpArrayPath: string[] = [];
	const tmpJSONPath: string[] = [];
	let i: number, l: number, key: string;

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
			tmpJSON.push(v);
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
		return getArrayFromJSON(
			tmpJSON[x]!,
			result,
			basePath ? basePath + '.' + tmpJSONPath[x as unknown as number] : tmpJSONPath[x as unknown as number]!,
		);
	}
}

export default (data: unknown): PatchMatchResult => {
	const result: PatchMatchResult = {
		data: [],
		matched: {},
		path: '',
		error: false,
	};
	if (isArray(data)) {
		result.data = data;
		return result;
	}
	if (isFunction(data)) {
		data = data();
	}
	if (isString(data)) {
		try {
			data = JSON.parse(data);
		} catch {
			result.error = true;
			return result;
		}
	}
	if (isObject(data)) {
		getArrayFromJSON(data, result);
	}

	getDataByImportance(data, result, 'data');

	return result;
};
/* eslint-disable */
