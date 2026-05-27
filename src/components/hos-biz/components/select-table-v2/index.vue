<template>
	<el-popover
		v-model:visible="visible"
		placement="bottom-start"
		:width="popoverWidth"
		popper-class="select-table-v2-popover"
		trigger="click"
		:disabled="disabled"
	>
		<el-biz-table
			v-bind="$attrs"
			:uid="tableUID"
			:ref="tableUID"
			:cols="cols"
			:data="resolvedTableData"
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
		</el-biz-table>
		<template #reference>
			<el-select
				ref="select"
				class="select-table-v2-popover-select"
				v-bind="$attrs"
				v-model="defaultValue"
				:disabled="disabled"
				popper-class="select-table-v2-dropdown-select"
				@visible-change="visibleChange"
			>
				<template v-if="selectPrefix" #prefix>
					<el-icon v-if="isHosTheme"><Briefcase /></el-icon>
					<img v-else src="@/assets/images/login/z61.png" alt="" />
				</template>
				<el-option
					v-for="row in currentTableData"
					:key="row[valueKey]"
					:label="String(row[labelKey] ?? '')"
					:value="row[valueKey]"
				/>
			</el-select>
		</template>
	</el-popover>
</template>

<script>
import { Briefcase } from '@element-plus/icons-vue';
import { useHosBizTableStore } from '@/stores/hosBizTable';

export default {
	name: 'HosBizSelectTable2',
	inheritAttrs: false,
	components: { Briefcase },
	emits: ['update:modelValue', 'input', 'change'],
	props: {
		modelValue: { type: [String, Number, Array], default: undefined },
		value: { type: [String, Number, Array], default: undefined },
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
		page: { type:  Object | Boolean },
		form: { type: Object },
		disabled: {type: Boolean, default: false},
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
		dropdownWidth: {type: Number, required: false},
		init: { type: Boolean , default: true},
		selectPrefix: { default: true },
	},
	data() {
		return {
			isHosTheme: import.meta.env.VITE_APP_THEME_STYLE === '1',
			defaultValue: this.multiple ? [] : '',
			selectRows: {},
			currentTableData: [],
			popoverWidth: '500px',
			visible: false,
			selectLabel: '',
		};
	},
	watch: {
		modelValue: {
			immediate: true,
			handler(val) {
				this.syncFromProp(val);
			},
		},
		value: {
			immediate: true,
			handler(val) {
				if (this.modelValue === undefined || this.modelValue === null) {
					this.syncFromProp(val);
				}
			},
		},
	},
	computed: {
		resolvedTableData() {
			if (this.tableData !== undefined && this.tableData !== null) {
				return this.tableData;
			}
			return this.$attrs.tableData ?? this.$attrs['table-data'];
		},
		tableUID() {
			return this.uid + '-select-table-dropdown-table';
		},
		valueKey() {
			return this.valueConfig.value;
		},
		labelKey() {
			return this.valueConfig.label;
		},
	},
	created() {
		this.initTable();
	},
	expose: ['refresh', 'fitHeight'],
	mounted() {
		this.$nextTick(() => {
			const el = this.$refs.select?.$el;
			if (el) {
				this.popoverWidth = el.offsetWidth;
			}
			if (this.dropdownWidth) {
				this.popoverWidth = this.dropdownWidth;
			}
		});
	},
	methods: {
		syncFromProp(val) {
			this.defaultValue =
				val !== undefined && val !== null
					? val
					: this.multiple
						? []
						: '';
			this.syncSelectLabel(this.defaultValue);
		},
		syncSelectLabel(val) {
			if (this.multiple || Array.isArray(val)) {
				return;
			}
			const target = this.currentTableData.find(
				(ele) => ele[this.valueKey] == val
			);
			this.selectLabel = target ? target[this.labelKey] : '';
		},
		emitModel(val) {
			this.$emit('update:modelValue', val);
			this.$emit('input', val);
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
			// 处理是否选中
			if (this.multiple) {
				// 处理多选点击行
			} else {
				const value = row[this.valueConfig.value];
				this.selectRows = {
					[value]: row,
				};
				this.defaultValue = row[this.valueConfig.value];
				this.selectLabel = row[this.valueConfig.label];
				this.$refs.select?.blur?.();
				this.emitModel(this.defaultValue);
				this.visible = false;
			}
		},
		select(rows, row) {
			// 处理是否选中
			var isSelect = rows.length && rows.indexOf(row) !== -1; // tip：row属于rows里的数据，同一地址，所以可判断
			if (isSelect) {
				this.selectRows[row[this.valueConfig.value]] = row;
				this.defaultValue.push(row[this.valueConfig.value]);
			} else {
				delete this.selectRows[row[this.valueConfig.value]];
				this.defaultValue.splice(
					this.defaultValue.findIndex(
						(item) => item === row[this.valueConfig.value]
					),
					1
				);
			}
			this.findLabel();
			this.emitModel(this.defaultValue);
		},
		selectAll(rows) {
			var isAllSelect = rows.length > 0;
			if (isAllSelect) {
				// 全选
				rows.forEach((row) => {
					this.selectRows[row[this.valueConfig.value]] = row;
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
					delete this.selectRows[row[this.valueConfig.value]];
					const index = this.defaultValue.findIndex(
						(item) => item === row[this.valueConfig.value]
					);
					if (index !== -1) {
						this.defaultValue.splice(index, 1);
					}
				});
			}
			this.findLabel();
			this.emitModel(this.defaultValue);
		},
		findLabel() {
			const row = this.selectRows[this.defaultValue];
			if (row) {
				this.selectLabel = row[this.valueConfig.label];
			}
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
			useHosBizTableStore().UPDATE_TABLE({ _uid: this.tableUID });
		},
		fitHeight(height) {
			this.$refs[this.tableUID]?.fitHeight?.(height);
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
	.hos-input__prefix {
		left: 0;
		right: auto;
	}
}
</style>