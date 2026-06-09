import type { ComponentPublicInstance } from 'vue';
import { EL_TABLE_REF } from '../../components/table';

type TableWrapper = ComponentPublicInstance & {
	$refs?: Record<string, ComponentPublicInstance | undefined>;
};

function getTableRef(vm: ComponentPublicInstance & { uid?: string | number }) {
	const wrapper = vm.$refs[`el-table-${vm.uid}`] as TableWrapper | undefined;
	return wrapper?.$refs?.[EL_TABLE_REF] ?? null;
}

type ElTableInstance = {
	clearSelection?: () => void;
	toggleRowSelection?: (row: unknown, selected?: boolean) => void;
	toggleAllSelection?: () => void;
	toggleRowExpansion?: (row: unknown, expanded?: boolean) => void;
	setCurrentRow?: (row: unknown) => void;
	clearSort?: () => void;
	clearFilter?: (columnKey?: string) => void;
	doLayout?: () => void;
	sort?: (prop: string, order: string) => void;
};

export const otherMethods = {
	methods: {
		clearSelection(this: ComponentPublicInstance) {
			const table = getTableRef(this) as ElTableInstance | null;
			if (table?.clearSelection) table.clearSelection();
		},
		toggleRowSelection(this: ComponentPublicInstance, row: unknown, selected?: boolean) {
			const table = getTableRef(this) as ElTableInstance | null;
			if (table?.toggleRowSelection) table.toggleRowSelection(row, selected);
		},
		toggleAllSelection(this: ComponentPublicInstance) {
			const table = getTableRef(this) as ElTableInstance | null;
			if (table?.toggleAllSelection) table.toggleAllSelection();
		},
		toggleRowExpansion(this: ComponentPublicInstance, row: unknown, expanded?: boolean) {
			const table = getTableRef(this) as ElTableInstance | null;
			if (table?.toggleRowExpansion) table.toggleRowExpansion(row, expanded);
		},
		setCurrentRow(this: ComponentPublicInstance, row: unknown) {
			const table = getTableRef(this) as ElTableInstance | null;
			if (table?.setCurrentRow) table.setCurrentRow(row);
		},
		clearSort(this: ComponentPublicInstance) {
			const table = getTableRef(this) as ElTableInstance | null;
			if (table?.clearSort) table.clearSort();
		},
		clearFilter(this: ComponentPublicInstance, columnKey?: string) {
			const table = getTableRef(this) as ElTableInstance | null;
			if (table?.clearFilter) table.clearFilter(columnKey);
		},
		doLayout(this: ComponentPublicInstance) {
			const table = getTableRef(this) as ElTableInstance | null;
			if (table?.doLayout) table.doLayout();
		},
		sort(this: ComponentPublicInstance, prop: string, order: string) {
			const table = getTableRef(this) as ElTableInstance | null;
			if (table?.sort) table.sort(prop, order);
		},
	},
};
