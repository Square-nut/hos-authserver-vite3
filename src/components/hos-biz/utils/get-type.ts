/* eslint-disable */
/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 11:10:41
 */

const getType = (v: unknown): string => {
	return Object.prototype.toString.call(v).match(/\[object ([A-Za-z]+)\]/)![1]!;
};

export const isArray = (v: unknown): v is unknown[] => {
	return 'Array' === getType(v);
};
export const isObject = (v: unknown): v is Record<string, unknown> => {
	return 'Object' === getType(v);
};
export const isFunction = (v: unknown): v is (...args: unknown[]) => unknown => {
	return 'Function' === getType(v);
};
export const isPromise = (v: unknown): v is Promise<unknown> => {
	return 'Promise' === getType(v);
};
export const isString = (v: unknown): v is string => {
	return 'String' === getType(v);
};
export const isNumber = (v: unknown): v is number => {
	return 'Number' === getType(v);
};

export default getType;
/* eslint-disable */
