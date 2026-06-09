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
import { h } from 'vue';
import SingleArray from '../../utils/single-array';
import { tableStoreComputed, hosBizUidMatches } from '../../utils/pinia-bridge';

export const EL_TABLE_REF = 'elTableRef';

const props = {
	uid: {
		default: 0,
	},
	cols: {
		required: true,
		type: Array,
	},
	asyncSlot: {
		default: {},
	},
};


const tableColumnParser = (() => {
	const rules = [];
	return {
		_parse(props, h) {
			let config = {
				props,
				scopedSlots: {},
			};
			if (typeof props.prop === 'string') {
				props.prop = props.prop.trim();
			}

			for (let i = 0, result; i < rules.length; i++) {
				if ((result = rules[i].call(this, config, h))) {
					return result;
				}
			}
			return config;
		},
		parse(cols, h) {
			return cols.map((v) => {
				const props = { ...v };
				const nested = props.children;
				if (Array.isArray(nested)) {
					delete props.children;
				}
				const parsed = tableColumnParser._parse.call(this, props, h);
				const colProps = parsed?.props ?? parsed;
				const scopedSlots = parsed?.scopedSlots;
				const childVnodes = Array.isArray(nested)
					? tableColumnParser.parse.call(this, nested, h)
					: undefined;
				const slots =
					scopedSlots && Object.keys(scopedSlots).length
						? scopedSlots
						: undefined;
				return h(
					ElTableColumn,
					colProps,
					slots || childVnodes,
				);
			});
		},
		add(fn) {
			rules.push(fn);
		},
	};
})();

function parseCustomNode(result, scope, h) {
	if (Array.isArray(result)) {
		return result.map((v) => parseCustomNode.call(this, v, scope, h));
	}
	return result;
}

/**
 * 自定义返回值解析器
 * 返回一个function,参数是sopce,createElement
 */
tableColumnParser.add(function ({ props, scopedSlots }, h) {
	if (typeof props.prop === 'function') {
		const func = props.prop;
		if (props.sortProp) {
			props.prop = props.sortProp
			delete props.sortProp
		} else {
			delete props.prop;
		}
		scopedSlots.default = (scope) => {
			return parseCustomNode.call(this, func(scope, h), scope, h);
		};
	}
});

/**
 * 自定义表头解析器
 */
tableColumnParser.add(function ({ props, scopedSlots }, h) {
	if (typeof props.label === 'function') {
		const func = props.label;
		delete props.label;
		scopedSlots.header = (scope) => {
			return parseCustomNode.call(this, func(scope, h), scope, h);
		};
	}
});

/**
 * 动态slot解析
 */
tableColumnParser.add(function ({ props, scopedSlots }, h) {
	if (typeof props.slotName === 'string') {
		const func = this.asyncSlot[props.slotName];
		scopedSlots.default = (scope) => {
			if (!func) return null;
			let _func;
			if (typeof func === 'function') {
				// Vue3 具名插槽为 () => VNode；旧产线为 (scope, h) => VNode
				_func = func.length > 0 ? func(scope, h) : func();
			} else {
				_func = func;
			}
			return parseCustomNode.call(this, _func, scope, h);
		};
	}
});

/**
 * 增加单元格专用渲染函数
 */
tableColumnParser.add(function ({ props, scopedSlots }, h) {
	if (props.render && typeof props.render === 'function') {
		const func = props.render;
		delete props.render;
		scopedSlots.default = (scope) => {
			return parseCustomNode.call(this, func(scope, h), scope, h);
		};
	}
});

/**
 * 多选框
 */
tableColumnParser.add(function ({ props, scopedSlots }, h) {
	if (props.type === 'checkbox') {
		const key = props.key || 'id';
		const currentValue = Array.isArray(this.value) ? this.value : [];
		if (!Array.isArray(this.value)) {
			this.$emit('input', []);
			this.$emit('update:modelValue', []);
		}
		const value = new SingleArray(currentValue, key);
		const emitValue = (next) => {
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
				'onUpdate:modelValue': (isChecked) => {
					emitValue(value[isChecked ? 'add' : 'delete'](this.$attrs.data));
				},
			});
		};
		scopedSlots.default = (prop) => {
			return h(ElCheckbox, {
				modelValue: currentValue.some((v) => v[key] === prop.row[key]),
				'onUpdate:modelValue': (isChecked) => {
					emitValue(value[isChecked ? 'add' : 'delete'](prop.row));
				},
			});
		};
	}
});

/**
 * 单选框
 */
tableColumnParser.add(function ({ props, scopedSlots }, h) {
	if (props.type === 'radio') {
		const key = props.key || 'id';
		scopedSlots.default = (prop) => {
			return h(
				ElRadio,
				{
					label: prop.row[key],
					modelValue: this.value[key],
					'onUpdate:modelValue': (val) => {
						const next = this.$attrs.data.filter((v) => v[key] === val)[0];
						this.$emit('input', next);
						this.$emit('update:modelValue', next);
					},
				},
				() =>
					props.prop
						? prop.row[props.prop]
						: [h('span', { style: { display: 'none' } })],
			);
		};
	}
});

export default {
	name: 'LTable',
	props,
	watch: {
		sTimestamp() {
			if (
				hosBizUidMatches(this.sUID, this.uid) ||
				(this.sUID === 0 && this.sEvent === 'doLayout')
			) {
				if (this.$refs[EL_TABLE_REF]) this.$refs[EL_TABLE_REF].doLayout()
			}
		},
	},
	computed: tableStoreComputed(),
	render() {
		const attrs = { ...this.$attrs };
		// 解析表格
		const cols = tableColumnParser.parse.call(this, this.cols, h);
		
		// 添加表格默认插槽（Vue3：default 为函数）
		const defaultSlot = this.$slots.default?.();
		if (defaultSlot?.length) {
			cols.push(...defaultSlot);
		}
		
		return h(ElTable, { ...attrs, ref: EL_TABLE_REF }, {
			default: () => cols,
		});
	},
};
