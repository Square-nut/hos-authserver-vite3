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
		<template #reference>
			<l-select
				class="select-table-v2-popover-select"
				popper-class="select-table-v2-dropdown-select"
				ref="select"
				v-bind="$attrs"
				v-model="defaultValue"
				:disabled="disabled"
				:select-value="selectLabel"
				@visible-change="visibleChange"
			>
				<template #prefix>
					<i
						v-if="selectPrefix && theme == 1"
						class="l-input__icon l-icom-post"
					></i>
					<img
						v-if="selectPrefix && theme != 1"
						src="../../../../assets/images/login/z61.png"
						class=" "
						alt=""
					/>
				</template>
				<template #suffix>
					<i class="l-input__icon l-icom-table-picker"></i>
				</template>
			</l-select>
		</template>
	</l-popover>
</template>

<script>
import { updateHosBizTable } from '@/composables/useHosBiz';

const themeStyle =
	import.meta.env.VITE_APP_THEME_STYLE ?? import.meta.env.VUE_APP_THEME_STYLE;

export default {
	name: 'HosBizSelectTable2',
	props: {
		value: { type: [String, Number, Array], default: '' },
		multiple: { type: Boolean, default: false },
		valueConfig: {
			type: Object,
			default: () => ({
				label: 'label',
				value: 'value',
			}),
		},
		cols: { type: Array, default: () => [] },
		page: {
			type: [Object, Boolean],
			default: undefined,
		},
		form: { type: Object, default: undefined },
		disabled: { type: Boolean, default: false },
		tableData: { required: true },
		uid: { required: true },
		rowClassName: { required: false },
		rowDisabledMethod: {
			required: false,
			type: Function,
			default: () => false,
		},
		dropdownWidth: { type: Number, required: false },
		init: { type: Boolean, default: true },
		selectPrefix: { default: true },
	},
	emits: ['input', 'change', 'update:modelValue'],
	data() {
		return {
			theme: themeStyle,
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
			handler(val) {
				this.defaultValue = val;
				const target = this.currentTableData.filter(
					(ele) => ele[this.valueConfig.value] == val,
				);
				if (Array.isArray(target) && target.length) {
					this.selectLabel = this.currentTableData.filter(
						(ele) => ele[this.valueConfig.value] == val,
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
	mounted() {
		this.popoverWidth = this.$refs.select.$el.offsetWidth;
		if (this.dropdownWidth) {
			this.popoverWidth = this.dropdownWidth;
		}
	},
	methods: {
		emitValue(val) {
			this.$emit('input', val);
			this.$emit('update:modelValue', val);
			this.$emit('change', val);
		},
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
			if (this.multiple) {
				return;
			} else {
				const value = row[this.valueConfig.value];
				this.selectRows = {
					[value]: row,
				};
				this.defaultValue = row[this.valueConfig.value];
				this.$refs.select.blur();
				this.findLabel();
				this.emitValue(this.defaultValue);
				this.visible = false;
			}
		},
		select(rows, row) {
			const isSelect = rows.length && rows.indexOf(row) !== -1;
			if (isSelect) {
				this.selectRows = {
					...this.selectRows,
					[row[this.valueConfig.value]]: row,
				};
				this.defaultValue.push(row[this.valueConfig.value]);
			} else {
				const key = row[this.valueConfig.value];
				const next = { ...this.selectRows };
				delete next[key];
				this.selectRows = next;
				const idx = this.defaultValue.findIndex((item) => item === key);
				if (idx !== -1) this.defaultValue.splice(idx, 1);
			}
			this.findLabel();
			this.emitValue(this.defaultValue);
		},
		selectAll(rows) {
			const isAllSelect = rows.length > 0;
			if (isAllSelect) {
				const nextRows = { ...this.selectRows };
				const nextVal = [...this.defaultValue];
				rows.forEach((row) => {
					nextRows[row[this.valueConfig.value]] = row;
					const isHas = nextVal.find(
						(item) => item === row[this.valueConfig.value],
					);
					if (!isHas) {
						nextVal.push(row[this.valueConfig.value]);
					}
				});
				this.selectRows = nextRows;
				this.defaultValue = nextVal;
			} else {
				const nextRows = { ...this.selectRows };
				this.$refs[this.tableUID].tableData.forEach((row) => {
					delete nextRows[row[this.valueConfig.value]];
					const index = this.defaultValue.findIndex(
						(item) => item === row[this.valueConfig.value],
					);
					if (index !== -1) {
						this.defaultValue.splice(index, 1);
					}
				});
				this.selectRows = nextRows;
			}
			this.findLabel();
			this.emitValue(this.defaultValue);
		},
		findLabel() {
			this.$nextTick(() => {
				if (this.multiple) {
					this.$refs.select.selected.forEach((item) => {
						const row = this.selectRows[item.value];
						if (row) {
							item.currentLabel = row[this.valueConfig.label];
						}
					});
				} else {
					const row = this.selectRows[this.defaultValue];
					if (row) {
						this.$refs.select.selectedLabel = row[this.valueConfig.label];
					}
				}
			});
		},
		findRowByKey(value) {
			return this.$refs[this.tableUID].tableData.find(
				(item) => item[this.valueConfig.value] === value,
			);
		},
		tableLoadAfter(data) {
			this.currentTableData = data;
		},
		filterTable(value) {
			this.$refs[this.tableUID].tableData = JSON.parse(
				JSON.stringify(this.currentTableData),
			);
			this.$refs[this.tableUID].tableData = this.$refs[
				this.tableUID
			].tableData.filter((item) => {
				for (let i = 0; i < this.cols.length; i++) {
					const c = this.cols[i];
					if (item[c.prop] && String(item[c.prop]).includes(value)) {
						return true;
					}
				}
				return false;
			});
		},
		visibleChange(visible) {
			if (!visible && this.defaultValue) {
				this.findLabel();
			}
		},
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
