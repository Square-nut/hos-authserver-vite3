/* eslint-disable */
/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 11:11:24
 */

/**
 * item支持格式object string
 * 如果存在key就按照object处理
 */
export default class SingleArray<T extends Record<string, unknown> | string | number> {
	key?: string;
	arr: T[];

	constructor(arr: T[], key?: string) {
		this.key = key;
		if (key) {
			const stringArr = [...new Set(arr.map((v) => (v as Record<string, unknown>)[key]))];
			this.arr = stringArr.map((v) => arr.filter((c) => (c as Record<string, unknown>)[key] === v)[0]!);
		} else {
			this.arr = arr ? [...new Set(arr)] : [];
		}
	}
	has(item: T | T[], isEvery?: boolean): boolean {
		if (Array.isArray(item)) {
			return item[isEvery ? 'every' : 'some']((v) => this.has(v));
		}
		return this.key
			? this.arr.some((v) => (v as Record<string, unknown>)[this.key!] === (item as Record<string, unknown>)[this.key!])
			: this.arr.includes(item);
	}
	add(item: T | T[]): T[] {
		if (Array.isArray(item)) {
			item.forEach((v) => {
				this.add(v);
			});
		} else if (!this.has(item)) {
			this.arr.push(item);
		}
		return this.arr;
	}
	delete(item: T | T[]): T[] {
		if (Array.isArray(item)) {
			item.forEach((v) => {
				this.delete(v);
			});
		} else {
			const index = this.key
				? this.arr.findIndex((v) => (v as Record<string, unknown>)[this.key!] === (item as Record<string, unknown>)[this.key!])
				: this.arr.indexOf(item);
			if (index !== -1) {
				this.arr.splice(index, 1);
			}
		}
		return this.arr;
	}
}
/* eslint-disable */
