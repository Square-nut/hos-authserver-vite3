/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 10:58:29
 * @Last Modified by: liruiqing@mediway.cn
 * @Last Modified time: 2026-05-09 12:05:51
 */
import type { PropType, Slots, VNode } from 'vue';
import { defineComponent, h } from 'vue';
import { ElCheckbox, ElRadio, ElTable, ElTableColumn } from 'element-plus';
import { mapState } from 'pinia';
import SingleArray from '../../utils/single-array';
import { useHosBizTableStore } from '@/stores/hosBizTable';
import {
	event,
	params,
	timestamp,
	uid,
} from '../../utils/store-config';

type ColItem = Record<string, unknown> & { children?: ColItem[]; _show?: boolean };

type ParsedColumn = {
	props: Record<string, unknown>;
	slots: Record<string, (scope: Record<string, unknown>) => VNode | VNode[]>;
};

const tableColumnParser = (() => {
	const rules: any[] = [];
	return {
		_parse(this: unknown, props: Record<string, unknown>, _h: typeof import('vue').h): ParsedColumn {
			const config: ParsedColumn = {
				props,
				slots: {},
			};
			if (typeof props.prop === 'string') {
				props.prop = (props.prop as string).trim();
			}

			for (let i = 0, result; i < rules.length; i++) {
				if ((result = rules[i]!.call(this, config, _h))) {
					return result as ParsedColumn;
				}
			}
			return config;
		},
		parse(this: unknown, cols: ColItem[], _h: typeof import('vue').h): VNode[] {
			return cols.map((v) => {
				const props = { ...v };
				const parsed = tableColumnParser._parse.call(this, props, _h);
				const nested: VNode[] | undefined = Array.isArray(props.children)
					? tableColumnParser.parse.call(this, props.children, _h)
					: undefined;
				if (nested) {
					return h(ElTableColumn, parsed.props, nested);
				}
				const slotKeys = Object.keys(parsed.slots);
				if (slotKeys.length) {
					return h(ElTableColumn, parsed.props, parsed.slots);
				}
				return h(ElTableColumn, parsed.props);
			});
		},
		add(fn: any) {
			rules.push(fn);
		},
	};
})();

function parseCustomNode(
	this: unknown,
	result: unknown,
	scope: Record<string, unknown>,
	_h: typeof import('vue').h,
): VNode | VNode[] {
	if (Array.isArray(result)) {
		return result.map((v) => parseCustomNode.call(this, v, scope, _h)) as unknown as VNode[];
	}
	return result as VNode;
}

tableColumnParser.add(function (
	this: { asyncSlot: Record<string, unknown> },
	{ props, slots }: ParsedColumn,
	_h: typeof h,
) {
	if (typeof props.prop === 'function') {
		const func = props.prop as (scope: Record<string, unknown>, h: typeof import('vue').h) => unknown;
		if (props.sortProp) {
			props.prop = props.sortProp;
			delete props.sortProp;
		} else {
			delete props.prop;
		}
		slots.default = (scope) => {
			return parseCustomNode.call(this, func(scope, _h), scope, _h);
		};
	}
});

tableColumnParser.add(function (
	this: unknown,
	{ props, slots }: ParsedColumn,
	_h: typeof h,
) {
	if (typeof props.label === 'function') {
		const func = props.label as (scope: Record<string, unknown>, h: typeof import('vue').h) => unknown;
		delete props.label;
		slots.header = (scope) => {
			return parseCustomNode.call(this, func(scope, _h), scope, _h);
		};
	}
});

tableColumnParser.add(function (
	this: { asyncSlot: Record<string, unknown> },
	{ props, slots }: ParsedColumn,
	_h: typeof h,
) {
	if (typeof props.slotName === 'string') {
		const func = this.asyncSlot[props.slotName];
		slots.default = (scope) => {
			const _func = typeof func === 'object' ? func : (func as (s: unknown, h: unknown) => unknown)(scope, _h);
			return parseCustomNode.call(this, _func, scope, _h);
		};
	}
});

tableColumnParser.add(function (
	this: unknown,
	{ props, slots }: ParsedColumn,
	_h: typeof h,
) {
	if (props.render && typeof props.render === 'function') {
		const func = props.render as (scope: Record<string, unknown>, h: typeof import('vue').h) => unknown;
		delete props.render;
		slots.default = (scope) => {
			return parseCustomNode.call(this, func(scope, _h), scope, _h);
		};
	}
});

tableColumnParser.add(function (
	this: {
		$attrs: Record<string, unknown>;
		$emit: (ev: string, ...args: unknown[]) => void;
		modelValue: unknown;
	},
	{ props, slots }: ParsedColumn,
	_h: typeof h,
) {
	if (props.type === 'checkbox') {
		const key = (props.key as string) || 'id';
		const rowValue = this.modelValue;
		if (!Array.isArray(rowValue)) {
			this.$emit('input', []);
			this.$emit('update:modelValue', []);
		}
		const value = new SingleArray(
			Array.isArray(rowValue) ? rowValue : [],
			key,
		);
		const tableData = this.$attrs.data as unknown[] | undefined;

		slots.header = () => {
			if (!tableData?.length || !Array.isArray(rowValue)) return h('span');
			const isAll = value.has(tableData, true);
			const isIndeterminate = value.has(tableData, false) && !isAll;
			return h(ElCheckbox, {
				indeterminate: isIndeterminate,
				modelValue: isAll,
				'onUpdate:modelValue': (val: string | number | boolean) => {
					const on = Boolean(val);
					const next = value[on ? 'add' : 'delete'](tableData);
					this.$emit('input', next);
					this.$emit('update:modelValue', next);
				},
			});
		};
		slots.default = (prop) => {
			const arr = Array.isArray(rowValue) ? rowValue : [];
			const row = prop.row as Record<string, unknown>;
			return h(ElCheckbox, {
				modelValue: arr.some((v: Record<string, unknown>) => v[key] === row[key]),
				'onUpdate:modelValue': (val: string | number | boolean) => {
					const on = Boolean(val);
					const next = value[on ? 'add' : 'delete'](row);
					this.$emit('input', next);
					this.$emit('update:modelValue', next);
				},
			});
		};
	}
});

tableColumnParser.add(function (
	this: {
		$attrs: Record<string, unknown>;
		$emit: (ev: string, ...args: unknown[]) => void;
		modelValue: Record<string, unknown>;
	},
	{ props, slots }: ParsedColumn,
	_h: typeof h,
) {
	if (props.type === 'radio') {
		const key = (props.key as string) || 'id';
		slots.default = (prop) => {
			const row = prop.row as Record<string, unknown>;
			const labelProp = props.prop as string | undefined;
			const mv = this.modelValue as Record<string, unknown>;
			return h(
				ElRadio,
				{
					label: row[key] as string | number | boolean,
					modelValue: mv[key] as string | number | boolean,
					'onUpdate:modelValue': (val?: string | number | boolean) => {
						const data = this.$attrs.data as unknown[];
						const picked = data.filter(
							(v): v is Record<string, unknown> =>
								typeof v === 'object' &&
								v !== null &&
								(v as Record<string, unknown>)[key] === val,
						)[0];
						this.$emit('input', picked);
						this.$emit('update:modelValue', picked);
					},
				},
				() =>
					labelProp
						? [String(row[labelProp] ?? '')]
						: [h('span', { style: 'display:none' })],
			);
		};
	}
});

export default defineComponent({
	name: 'LTable',
	inheritAttrs: false,
	props: {
		uid: {
			type: [Number, String],
			default: 0,
		},
		cols: {
			type: Array as PropType<ColItem[]>,
			required: true,
		},
		asyncSlot: {
			type: Object as PropType<Record<string, unknown>>,
			default: () => ({}),
		},
		modelValue: {
			type: null as unknown as PropType<unknown>,
			default: undefined,
		},
	},
	emits: ['input', 'update:modelValue'],
	computed: {
		...mapState(useHosBizTableStore, {
			sTimestamp: timestamp,
			sUID: uid,
			sEvent: event,
			sParams: params,
		}),
	},
	watch: {
		sTimestamp() {
			if (
				this.sUID === this.uid ||
				(this.sUID === 0 && this.sEvent === 'doLayout')
			) {
				const t = this.$refs['el-table-lq'] as { doLayout?: () => void } | undefined;
				t?.doLayout?.();
			}
		},
	},
	render() {
		const cols = tableColumnParser.parse.call(this, this.cols, h);

		const defaultSlot = (this.$slots as Slots)?.default?.();
		if (defaultSlot) {
			cols.push(...defaultSlot);
		}

		return h(
			ElTable,
			{
				ref: 'el-table-lq',
				id: 'el-table-lq',
				...(this.$attrs as Record<string, unknown>),
			},
			{ default: () => cols },
		);
	},
});
