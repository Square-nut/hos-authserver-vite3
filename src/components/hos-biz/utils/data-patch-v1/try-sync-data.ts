/* eslint-disable */
import type { ComponentPublicInstance } from 'vue';

const getValue = (o: Record<string, unknown>, k: string): unknown => {
	let current: unknown = o;
	k.split('.').forEach((v) => {
		current = (current as Record<string, unknown>)[v];
	});
	return current;
};

export default (vm: ComponentPublicInstance, path: string) => {
	const data = getValue(vm as unknown as Record<string, unknown>, path) as Record<string, unknown>;
	const keys = Object.keys(data);
	keys.forEach((k) => {
		if (k.indexOf('TEMP_ARRAY_') === 0) {
			const arr = k.split('TEMP_ARRAY_')[1]!.split('_');
			vm.$watch(
				`${path}.${k}`,
				(newValue: unknown) => {
					arr.forEach((v) => {
						const val = Array.isArray(newValue) ? newValue[arr.indexOf(v)] : newValue;
						if (val === null) {
							data[v] = undefined;
						} else if (data[v] !== val) {
							data[v] = val;
						}
					});
				},
				{
					immediate: true,
				},
			);
		}
	});
	return data;
};
/* eslint-disable */
