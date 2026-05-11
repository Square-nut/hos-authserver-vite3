import type { ComponentPublicInstance } from 'vue';

function getValue(o: unknown, k: string): unknown {
	let cur: unknown = o;
	for (const segment of k.split('.')) {
		if (cur !== null && typeof cur === 'object' && segment in cur) {
			cur = (cur as Record<string, unknown>)[segment];
		} else {
			return undefined;
		}
	}
	return cur;
}

export default function trySyncData(
	vm: ComponentPublicInstance,
	path: string,
): Record<string, unknown> {
	const data = getValue(vm, path);
	if (!data || typeof data !== 'object') {
		return {};
	}
	const record = data as Record<string, unknown>;
	const keys = Object.keys(record);
	keys.forEach((k) => {
		if (k.indexOf('TEMP_ARRAY_') === 0) {
			const rest = k.split('TEMP_ARRAY_')[1];
			if (!rest) return;
			const arr = rest.split('_');
			vm.$watch(
				`${path}.${k}`,
				(newValue: unknown) => {
					arr.forEach((v) => {
						const val = Array.isArray(newValue)
							? newValue[arr.indexOf(v)]
							: newValue;
						if (val === null) {
							record[v] = undefined;
						} else if (record[v] !== val) {
							record[v] = val;
						}
					});
				},
				{
					immediate: true,
				},
			);
		}
	});
	return record;
}
