/* eslint-disable */
/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 11:11:01
 */

import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';

export interface ParamsRule {
	parse(params: string): Record<string, unknown>;
	componentization(params: Record<string, unknown>): string;
}

export interface ParamsVm {
	uid: string | number;
	$route: RouteLocationNormalizedLoaded;
	$router: Router;
}

const rules: Record<string, ParamsRule> = {};

export const get = (type: string, vm: ParamsVm, field?: string) => {
	const params = vm.$route.query;
	const uid = vm.uid;
	for (const i in params) {
		if (`${type}.${uid}` === i) {
			const parsed = rules[type]!.parse(String(params[i]));
			return field ? parsed[field] : parsed;
		}
	}
	return null;
};

export const clear = (type: string, vm: ParamsVm) => {
	const uid = vm.uid;
	const query = { ...vm.$route.query };
	delete query[`${type}.${uid}`];
	if (JSON.stringify(query) !== JSON.stringify(vm.$route.query)) {
		vm.$router.replace({
			query,
		});
	}
};

export const set = (type: string, vm: ParamsVm, params: Record<string, unknown>) => {
	const uid = vm.uid;
	const newQuery: Record<string, string> = {
		[`${type}.${uid}`]: rules[type]!.componentization(params),
	};
	return new Promise<Record<string, unknown>>((resolve) => {
		if (Object.keys(newQuery).every((v) => vm.$route.query[v] == newQuery[v])) {
			resolve(params);
		} else {
			vm.$router
				.replace({
					query: {
						...vm.$route.query,
						...newQuery,
					},
				})
				.then(() => resolve(params))
				.catch(() => resolve(params));
		}
	});
};

export const addRule = (type: string, rule: ParamsRule) => {
	rules[type] = rule;
};

export default class Params {
	type: string;
	vm: ParamsVm;

	constructor(type: string, vm: ParamsVm) {
		this.type = type;
		this.vm = vm;
	}
	get(field?: string) {
		return get(this.type, this.vm, field);
	}
	set(params: Record<string, unknown>) {
		return set(this.type, this.vm, params);
	}
	clear() {
		return clear(this.type, this.vm);
	}
}
/* eslint-disable */
