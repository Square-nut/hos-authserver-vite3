/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 10:58:29
 * @Last Modified by: liruiqing@mediway.cn
 * @Last Modified time: 2024-04-17 15:31:22
 */
import SingleArray from '../../utils/single-array';
import { tableStoreComputed } from '../../utils/pinia-bridge';

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
				if( v._show === true) {
					
				}
				const props = { ...v };
				return h(
					'hos-table-column',
					tableColumnParser._parse.call(this, props, h),
					Array.isArray(props.children)
						? tableColumnParser.parse.call(this, props.children, h)
						: undefined
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
		const func = this.asyncSlot[props.slotName]
		scopedSlots.default = scope => {
			let _func = typeof func === 'object'? func : func(scope, h)
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
		if (!Array.isArray(this.value)) {
			this.$emit('input', []);
		}
		const value = new SingleArray(this.value, key);

		scopedSlots.header = () => {
			if (this.$attrs.data.length === 0 || !Array.isArray(this.value)) return;
			const isAll = value.has(this.$attrs.data, true);
			const isIndeterminate = value.has(this.$attrs.data, false) && !isAll;
			return h('hos-checkbox', {
				indeterminate: isIndeterminate,
				modelValue: isAll,
				'onUpdate:modelValue': (isChecked) => {
					this.$emit(
						'input',
						value[isChecked ? 'add' : 'delete'](this.$attrs.data),
					);
				},
			});
		};
		scopedSlots.default = (prop) => {
			return h('hos-checkbox', {
				modelValue: this.value.some((v) => v[key] === prop.row[key]),
				'onUpdate:modelValue': (isChecked) => {
					this.$emit('input', value[isChecked ? 'add' : 'delete'](prop.row));
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
				'hos-radio',
				{
					label: prop.row[key],
					modelValue: this.value[key],
					'onUpdate:modelValue': (val) => {
						this.$emit(
							'input',
							this.$attrs.data.filter((v) => v[key] === val)[0],
						);
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
				this.sUID === this.uid ||
				(this.sUID === 0 && this.sEvent === 'doLayout')
			) {
				if (this.$refs['hos-table-lq']) this.$refs['hos-table-lq'].doLayout()
			}
		},
	},
	computed: tableStoreComputed(),
	render(h) {
		const attrs = { ...this.$attrs };
		// 解析表格
		const cols = tableColumnParser.parse.call(this, this.cols, h);
		
		// 添加表格默认插槽
		if (this.$slots.default) {
			cols.push(...this.$slots.default)
		}
		
		return h(
			'hos-table',
			{
				...attrs,
				ref: 'hos-table-lq',
				id: 'hos-table-lq',
			},
			cols
		);
	},
};
