const getType = (v: unknown): string => {
	const m = Object.prototype.toString.call(v).match(/\[object ([A-Za-z]+)\]/);
	return m?.[1] ?? '';
};

export const isArray = (v: unknown): v is unknown[] =>
	'Array' === getType(v);
export const isObject = (v: unknown): boolean => 'Object' === getType(v);
export const isFunction = (v: unknown): v is (...args: unknown[]) => unknown =>
	'Function' === getType(v);
export const isPromise = (v: unknown): v is Promise<unknown> =>
	'Promise' === getType(v);
export const isString = (v: unknown): v is string => 'String' === getType(v);
export const isNumber = (v: unknown): boolean => 'Number' === getType(v);

export default getType;
