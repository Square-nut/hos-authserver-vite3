/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 10:58:29
 * @Last Modified by: liruiqing@mediway.cn
 * @Last Modified time: 2024-04-17 15:31:22
 */
import {
	ElCheckbox,
	ElRadio,
	ElTable,
	ElTableColumn,
} from '../../utils/element-plus-resolve';
import { h, defineComponent, type PropType, type VNode, type Component, type ComponentPublicInstance } from 'vue';
import SingleArray from '../../utils/single-array';
import { tableStoreComputed, hosBizUidMatches } from '../../utils/pinia-bridge';
import type { TableInstance, CheckboxValueType } from 'element-plus';

export const EL_TABLE_REF = 'elTableRef';

export interface TableColConfig {
	prop?: string | ((scope: Record<string, unknown>, h: typeof import('vue').h) => unknown);
	sortProp?: string;
	label?: string | ((scope: Record<string, unknown>, h: typeof import('vue').h) => unknown);
	slotName?: string;
	render?: (scope: Record<string, unknown>, h: typeof import('vue').h) => unknown;
	type?: string;
	key?: string;
	children?: TableColConfig[];
	[key: string]: unknown;
}

interface ParsedColumnConfig {
	props: TableColConfig;
	scopedSlots: Record<string, (scope: Record<string, unknown>) => VNode | VNode[] | null | unknown>;
}

type TableInstanceVm = ComponentPublicInstance & {
	uid: string | number;
	cols: TableColConfig[];
	asyncSlot: Record<string, unknown>;
	value: unknown;
	sUID: unknown;
	sEvent: string;
	sTimestamp: unknown;
	$attrs: Record<string, unknown> & { data: Record<string, unknown>[] };
	$refs: Record<string, TableInstance | undefined>;
	$emit: (event: 'input' | 'update:modelValue', value: unknown) => void;
	$slots: { default?: () => VNode[] };
};

const props = {
	uid: {
		type: [String, Number],
		default: 0,
	},
	cols: {
		required: true,
		type: Array as PropType<TableColConfig[]>,
	},
	asyncSlot: {
		default: () => ({}),
		type: Object as PropType<Record<string, unknown>>,
	},
};

type ColumnParserRule = (
	this: TableInstanceVm,
	config: ParsedColumnConfig,
	h: typeof import('vue').h,
) => ParsedColumnConfig | void;

const tableColumnParser = (() => {
	const rules: ColumnParserRule[] = [];
	return {
		_parse(this: TableInstanceVm, props: TableColConfig, h: typeof import('vue').h) {
			const config: ParsedColumnConfig = {
				props,
				scopedSlots: {},
			};
			if (typeof props.prop === 'string') {
				props.prop = props.prop.trim();
			}

			for (let i = 0, result; i < rules.length; i++) {
				if ((result = rules[i]!.call(this, config, h))) {
					return result;
				}
			}
			return config;
		},
		parse(this: TableInstanceVm, cols: TableColConfig[], h: typeof import('vue').h): VNode[] {
			return cols.map((v) => {
				const colProps = { ...v };
				const nested = colProps.children;
				if (Array.isArray(nested)) {
					delete colProps.children;
				}
				const parsed = tableColumnParser._parse.call(this, colProps, h);
				const columnProps = (parsed?.props ?? parsed) as Record<string, unknown>;
				const scopedSlots = parsed?.scopedSlots;
				const childVnodes: VNode[] | undefined = Array.isArray(nested)
					? tableColumnParser.parse.call(this, nested, h)
					: undefined;
				const slots =
					scopedSlots && Object.keys(scopedSlots).length ? scopedSlots : undefined;
				return h(ElTableColumn, columnProps, slots || childVnodes);
			});
		},
		add(fn: ColumnParserRule) {
			rules.push(fn);
		},
	};
})();

function parseCustomNode(
	this: TableInstanceVm,
	result: unknown,
	scope: Record<string, unknown>,
	h: typeof import('vue').h,
): VNode | VNode[] | null | unknown {
	if (Array.isArray(result)) {
		return result.map((v) => parseCustomNode.call(this, v, scope, h));
	}
	return result;
}

tableColumnParser.add(function ({ props, scopedSlots }, h) {
	if (typeof props.prop === 'function') {
		const func = props.prop;
		if (props.sortProp) {
			props.prop = props.sortProp;
			delete props.sortProp;
		} else {
			delete props.prop;
		}
		scopedSlots.default = (scope) => {
			return parseCustomNode.call(this, func(scope, h), scope, h);
		};
	}
});

tableColumnParser.add(function ({ props, scopedSlots }, h) {
	if (typeof props.label === 'function') {
		const func = props.label;
		delete props.label;
		scopedSlots.header = (scope) => {
			return parseCustomNode.call(this, func(scope, h), scope, h);
		};
	}
});

tableColumnParser.add(function ({ props, scopedSlots }, h) {
	if (typeof props.slotName === 'string') {
		const func = this.asyncSlot[props.slotName];
		scopedSlots.default = (scope) => {
			if (!func) return null;
			let _func: unknown;
			if (typeof func === 'function') {
				_func = func.length > 0 ? (func as (scope: Record<string, unknown>, h: typeof import('vue').h) => unknown)(scope, h) : (func as () => unknown)();
			} else {
				_func = func;
			}
			return parseCustomNode.call(this, _func, scope, h);
		};
	}
});

tableColumnParser.add(function ({ props, scopedSlots }, h) {
	if (props.render && typeof props.render === 'function') {
		const func = props.render;
		delete props.render;
		scopedSlots.default = (scope) => {
			return parseCustomNode.call(this, func(scope, h), scope, h);
		};
	}
});

tableColumnParser.add(function ({ props, scopedSlots }, h) {
	if (props.type === 'checkbox') {
		const key = props.key || 'id';
		const currentValue = Array.isArray(this.value) ? this.value : [];
		if (!Array.isArray(this.value)) {
			this.$emit('input', []);
			this.$emit('update:modelValue', []);
		}
		const value = new SingleArray(currentValue as Record<string, unknown>[], key);
		const emitValue = (next: unknown) => {
			this.$emit('input', next);
			this.$emit('update:modelValue', next);
		};

		scopedSlots.header = () => {
			if (this.$attrs.data.length === 0 || !Array.isArray(this.value)) return;
			const isAll = value.has(this.$attrs.data, true);
			const isIndeterminate = value.has(this.$attrs.data, false) && !isAll;
			return h(ElCheckbox, {
				indeterminate: isIndeterminate,
				modelValue: isAll,
				'onUpdate:modelValue': (val: CheckboxValueType) => {
					const isChecked = Boolean(val);
					emitValue(value[isChecked ? 'add' : 'delete'](this.$attrs.data));
				},
			});
		};
		scopedSlots.default = (prop) => {
			const row = (prop as { row: Record<string, unknown> }).row;
			return h(ElCheckbox, {
				modelValue: currentValue.some((v) => (v as Record<string, unknown>)[key] === row[key]),
				'onUpdate:modelValue': (val: CheckboxValueType) => {
					const isChecked = Boolean(val);
					emitValue(value[isChecked ? 'add' : 'delete'](row));
				},
			});
		};
	}
});

tableColumnParser.add(function ({ props, scopedSlots }, h) {
	if (props.type === 'radio') {
		const key = props.key || 'id';
		scopedSlots.default = (prop) => {
			const row = (prop as { row: Record<string, unknown> }).row;
			return h(
				ElRadio,
				{
					label: row[key] as string | number | boolean,
					modelValue: (this.value as Record<string, unknown>)[key] as string | number | boolean,
					'onUpdate:modelValue': (val: string | number | boolean | undefined) => {
						const next = this.$attrs.data.filter((v) => v[key] === val)[0];
						this.$emit('input', next);
						this.$emit('update:modelValue', next);
					},
				},
				() =>
					props.prop
						? row[props.prop as string]
						: [h('span', { style: { display: 'none' } })],
			);
		};
	}
});

const LTable = defineComponent({
	name: 'LTable',
	props,
	watch: {
		sTimestamp(this: TableInstanceVm) {
			if (
				hosBizUidMatches(this.sUID, this.uid) ||
				(this.sUID === 0 && this.sEvent === 'doLayout')
			) {
				if (this.$refs[EL_TABLE_REF]) this.$refs[EL_TABLE_REF]!.doLayout?.();
			}
		},
	},
	computed: tableStoreComputed(),
	render(this: TableInstanceVm) {
		const attrs = { ...this.$attrs };
		const cols = tableColumnParser.parse.call(this, this.cols, h);

		const defaultSlot = this.$slots.default?.();
		if (defaultSlot?.length) {
			cols.push(...defaultSlot);
		}

		return h(
			ElTable,
			{ ...attrs, ref: EL_TABLE_REF },
			{
				default: () => cols,
			},
		);
	},
});

export default LTable as Component;
