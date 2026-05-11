import { isObject } from '../get-type';
import { addMatchedPath, getDataByImportance, type GuessResult } from './try-get-only-array';

const find = (
	data: unknown,
	keywords: string[],
	result: GuessResult,
	basePath = '',
): void => {
	if (!isObject(data)) return;
	const obj = data as Record<string, unknown>;
	for (const i in obj) {
		keywords.forEach((key) => {
			if (i.toLowerCase().includes(key.toLowerCase())) {
				addMatchedPath(result, i, basePath);
			}
		});

		if (isObject(obj[i])) {
			find(obj[i], keywords, result, basePath ? basePath + '.' + i : i);
		}
	}
};

export default function tryGetPaginationParams(data: unknown): GuessResult {
	const result: GuessResult = {
		total: undefined,
		matched: {},
		path: '',
		error: false,
	};

	const keys = ['total', 'count'];

	find(data, keys, result);

	getDataByImportance(data, result, 'total');

	return result;
}
