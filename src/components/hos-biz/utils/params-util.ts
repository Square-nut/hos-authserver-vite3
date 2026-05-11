import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';

export interface ParamsRule {
	parse: (encoded: string) => Record<string, unknown>;
	componentization: (params: unknown) => string;
}

const rules: Record<string, ParamsRule> = {};

/** Vue instance shape used by Params (route query sync). */
export interface ParamsVm {
	uid: string | number;
	$route: RouteLocationNormalizedLoaded;
	$router: Router;
}

export const get = (
	type: string,
	vm: ParamsVm,
	field?: string,
): unknown => {
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

export const clear = (type: string, vm: ParamsVm): void => {
	const uid = vm.uid;
	const query = { ...vm.$route.query };
	delete query[`${type}.${uid}`];
	if (JSON.stringify(query) !== JSON.stringify(vm.$route.query)) {
		vm.$router.replace({
			query,
		});
	}
};

export const set = (
	type: string,
	vm: ParamsVm,
	params: unknown,
): Promise<unknown> => {
	const uid = vm.uid;
	const newQuery = {
		[`${type}.${uid}`]: rules[type]!.componentization(params),
	};
	return new Promise((resolve) => {
		if (Object.keys(newQuery).every((v) => vm.$route.query[v] == newQuery[v])) {
			resolve(params);
		} else {
			void vm.$router
				.replace({
					query: {
						...vm.$route.query,
						...newQuery,
					},
				})
				.then(() => resolve(params));
		}
	});
};

export const addRule = (type: string, rule: ParamsRule): void => {
	rules[type] = rule;
};

export default class Params {
	type: string;
	vm: ParamsVm;

	constructor(type: string, vm: ParamsVm) {
		this.type = type;
		this.vm = vm;
	}

	get(field?: string): unknown {
		return get(this.type, this.vm, field);
	}

	set(params: unknown): Promise<unknown> {
		return set(this.type, this.vm, params);
	}

	clear(): void {
		clear(this.type, this.vm);
	}
}
