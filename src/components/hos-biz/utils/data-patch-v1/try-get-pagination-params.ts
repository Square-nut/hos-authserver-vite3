/* eslint-disable */
/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 11:09:57
 */

import { isObject } from '../get-type';

import { addMatchedPath, getDataByImportance, type PatchBaseResult } from './try-get-only-array';

export interface PaginationPatchResult extends PatchBaseResult {
	total?: number;
}

const find = (
	data: Record<string, unknown>,
	keys: string[],
	result: PaginationPatchResult,
	basePath = '',
) => {
	for (const i in data) {
		keys.forEach((key) => {
			if (i.toLowerCase().includes(key.toLowerCase())) {
				addMatchedPath(result, i, basePath);
			}
		});

		if (isObject(data[i])) {
			find(data[i] as Record<string, unknown>, keys, result, basePath ? basePath + '.' + i : i);
		}
	}
};

export default (data: unknown): PaginationPatchResult => {
	const result: PaginationPatchResult = {
		total: undefined,
		matched: {},
		path: '',
		error: false,
	};

	const keys = ['total', 'count'];

	if (isObject(data)) {
		find(data, keys, result);
		getDataByImportance(data, result, 'total');
	}

	return result;
};
/* eslint-disable */
