import { EL_TABLE_REF } from '../../components/table/index.js';

function getTableRef(vm) {
	const wrapper = vm.$refs[`el-table-${vm.uid}`];
	return wrapper?.$refs?.[EL_TABLE_REF] ?? null;
}

export const otherMethods = {
	methods: {
		clearSelection() {
			const table = getTableRef(this);
			if (table?.clearSelection) table.clearSelection();
		},
		toggleRowSelection(row, selected) {
			const table = getTableRef(this);
			if (table?.toggleRowSelection) table.toggleRowSelection(row, selected);
		},
		toggleAllSelection() {
			const table = getTableRef(this);
			if (table?.toggleAllSelection) table.toggleAllSelection();
		},
		toggleRowExpansion(row, expanded) {
			const table = getTableRef(this);
			if (table?.toggleRowExpansion) table.toggleRowExpansion(row, expanded);
		},
		setCurrentRow(row) {
			const table = getTableRef(this);
			if (table?.setCurrentRow) table.setCurrentRow(row);
		},
		clearSort() {
			const table = getTableRef(this);
			if (table?.clearSort) table.clearSort();
		},
		clearFilter(columnKey) {
			const table = getTableRef(this);
			if (table?.clearFilter) table.clearFilter(columnKey);
		},
		doLayout() {
			const table = getTableRef(this);
			if (table?.doLayout) table.doLayout();
		},
		sort(prop, order) {
			const table = getTableRef(this);
			if (table?.sort) table.sort(prop, order);
		},
	},
};
