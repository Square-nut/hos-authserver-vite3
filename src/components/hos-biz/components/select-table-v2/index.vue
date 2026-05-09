<template>
	<l-popover
		v-model="visible"
		placement="bottom-start"
		:width="popoverWidth"
		popper-class="select-table-v2-popover"
		trigger="click"
		:disabled="disabled"
	>
		<l-biz-table
			v-on="$listeners"
			v-bind="$attrs"
			:uid="tableUID"
			:ref="tableUID"
			:cols="cols"
			:data="tableData"
			:page="page"
			:form="form"
			@row-click="rowClick"
			@select="select"
			@select-all="selectAll"
			@after-load="tableLoadAfter"
			:row-class-name="rowClassName"
			:init="init"
		>
			<template v-if="form" #form>
				<slot name="form"></slot>
			</template>
			<template v-if="$slots.toolbar" #toolbar>
				<slot name="toolbar"></slot>
			</template>
		</l-biz-table>
		<l-select
			class="select-table-v2-popover-select"
			popper-class="select-table-v2-dropdown-select"
			slot="reference"
			ref="select"
			v-bind="$attrs"
			v-on="$listeners"
			v-model="defaultValue"
			:disabled="disabled"
			:select-value="selectLabel"
		>
			<i
				v-if="selectPrefix && theme == 1"
				class="l-input__icon l-icom-post"
				slot="prefix"
			></i>
			<img
				v-if="selectPrefix && theme != 1"
				src="../../../../assets/images/login/z61.png"
				class=" "
				slot="prefix"
			/>
			<i class="l-input__icon l-icom-table-picker" slot="suffix"></i>
		</l-select>
		<!-- <l-button slot="reference">click 激活</l-button> -->
	</l-popover>
</template>

<script>
import { updateHosBizTable } from '@/composables/useHosBiz';

export default {
	name: 'HosBizSelectTable2',
	props: {
		value: { type: [String, Number, Array], default: '' },
		multiple: { type: Boolean, default: false },

		// 选择框的映射(label、value)配置
		valueConfig: {
			type: Object,
			default: () => {
				return {
					label: 'label',
					value: 'value',
				};
			},
		},

		// 列表参数
		cols: { type: Array, default: () => [] },
		page: { type: Object | Boolean },
		form: { type: Object },
		disabled: { type: Boolean, default: false },
		tableData: { required: true },
		uid: { required: true },
		rowClassName: { required: false },
		rowDisabledMethod: {
			required: false,
			type: Function,
			default: (row) => {
				return false;
			},
		},
		dropdownWidth: { type: Number, required: false },
		init: { type: Boolean, default: true },
		selectPrefix: { default: true },
	},
	data() {
		return {
			theme: process.env.VUE_APP_SIMPLE_ONCE,
			defaultValue: [],
			selectRows: {},
			currentTableData: [],
			popoverWidth: '500px',
			visible: false,
			selectLabel: '',
		};
	},
	watch: {
		value: {
			handler(val, old) {
				this.defaultValue = val;
				const target = this.currentTableData.filter(
					(ele) => ele[this.valueConfig.value] == val
				);
				if (Array.isArray(target) && target.length) {
					this.selectLabel = this.currentTableData.filter(
						(ele) => ele[this.valueConfig.value] == val
					)[0][this.valueConfig.label];
				} else {
					this.selectLabel = '';
				}
			},
		},
	},
	computed: {
		tableUID() {
			return this.uid + '-select-table-dropdown-table';
		},
	},
	created() {},
	mounted() {
		this.popoverWidth = this.$refs.select.$el.offsetWidth;
		if (this.dropdownWidth) {
			this.popoverWidth = this.dropdownWidth;
		}
		// this.$refs.uid.doLayout();
		// select-table-dropdown-table
	},
	methods: {
		initTable() {
			if (this.multiple === true) {
				this.cols.splice(0, 0, {
					type: 'selection',
					width: '50',
					align: 'center',
				});
			}
		},

		rowClick(row) {
			if (this.rowDisabledMethod(row)) {
				return;
			}
			// 处理是否选中
			if (this.multiple) {
				// 处理多选点击行
			} else {
				const value = row[this.valueConfig.value];
				this.selectRows = {
					[value]: row,
				};
				this.defaultValue = row[this.valueConfig.value];
				this.$refs.select.blur();
				this.findLabel();
				this.$emit('input', this.defaultValue);
				this.$emit('change', this.defaultValue);
				this.visible = false;
			}
		},
		select(rows, row) {
			// 处理是否选中
			var isSelect = rows.length && rows.indexOf(row) !== -1; // tip：row属于rows里的数据，同一地址，所以可判断
			if (isSelect) {
				// 选中
				this.$set(this.selectRows, row[this.valueConfig.value], row);
				this.defaultValue.push(row[this.valueConfig.value]);
			} else {
				this.$delete(this.selectRows, row[this.valueConfig.value]);
				this.defaultValue.splice(
					this.defaultValue.findIndex(
						(item) => item === row[this.valueConfig.value]
					),
					1
				);
			}
			this.findLabel();
			this.$emit('input', this.defaultValue);
			this.$emit('change', this.defaultValue);
		},
		selectAll(rows) {
			var isAllSelect = rows.length > 0;
			if (isAllSelect) {
				// 全选
				rows.forEach((row) => {
					this.$set(this.selectRows, row[this.valueConfig.value], row);
					var isHas = this.defaultValue.find(
						(item) => item === row[this.valueConfig.value]
					);
					if (!isHas) {
						this.defaultValue.push(row[this.valueConfig.value]);
					}
				});
			} else {
				// 全不选
				this.$refs[this.tableUID].tableData.forEach((row) => {
					this.$delete(this.selectRows, row[this.valueConfig.value]);
					const index = this.defaultValue.findIndex(
						(item) => item === row[this.valueConfig.value]
					);
					if (index !== -1) {
						this.defaultValue.splice(index, 1);
					}
				});
			}
			this.findLabel();
			this.$emit('input', this.defaultValue);
			this.$emit('change', this.defaultValue);
		},
		findLabel() {
			this.$nextTick(() => {
				if (this.multiple) {
					this.$refs.select.selected.forEach((item) => {
						var row = this.selectRows[item.value];
						if (row) {
							item.currentLabel = row[this.valueConfig.label];
						}
					});
				} else {
					var row = this.selectRows[this.defaultValue];
					if (row) {
						this.$refs.select.selectedLabel = row[this.valueConfig.label];
					}
				}
			});
		},
		// 关键值查询表格数据行
		findRowByKey(value) {
			return this.$refs[this.tableUID].tableData.find(
				(item) => item[this.valueConfig.value] === value
			);
		},

		// 列表加载完数据 置勾选状态
		tableLoadAfter(data) {
			this.currentTableData = data;
		},

		filterTable(value) {
			//先恢复数据
			this.$refs[this.tableUID].tableData = JSON.parse(
				JSON.stringify(this.currentTableData)
			);
			//再检索数据
			this.$refs[this.tableUID].tableData = this.$refs[
				this.tableUID
			].tableData.filter((item) => {
				for (let i = 0; i < this.cols.length; i++) {
					let c = this.cols[i];
					if (item[c.prop].includes(value)) {
						return true;
					}
				}
			});
		},
		visibleChange(visible) {
			if (!visible && this.defaultValue) {
				this.findLabel();
			}
		},
		// 根据选中的值获取选中行的所有内容
		getRowByValue(value) {
			return this.selectRows[value];
		},

		refresh() {
			updateHosBizTable({ _uid: this.tableUID });
		},
	},
};
</script>

<style scoped>
.sc-table-select__table {
	padding: 12px;
}
.sc-table-select__page {
	padding-top: 12px;
}
</style>
<style lang="scss">
.select-table-v2-dropdown-select {
	display: none;
}
.select-suffix {
	position: absolute;
}
.post-select {
	.l-input__prefix {
		left: 0;
		right: auto;
	}
}
</style>
