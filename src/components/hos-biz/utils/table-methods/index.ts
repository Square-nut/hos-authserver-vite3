import type { ComponentPublicInstance } from 'vue';

type InnerTable = {
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

type TableHost = ComponentPublicInstance & { uid: string | number };

function getInnerTable(vm: TableHost): InnerTable | undefined {
	const outer = vm.$refs['l-table-' + vm.uid] as
		| { $refs?: Record<string, InnerTable> }
		| undefined;
	return outer?.$refs?.['l-table-lq'];
}

export const otherMethods = {
	methods: {
		clearSelection(this: TableHost) {
			getInnerTable(this)?.clearSelection?.();
		},
		toggleRowSelection(this: TableHost, row: unknown, selected?: boolean) {
			getInnerTable(this)?.toggleRowSelection?.(row, selected);
		},
		toggleAllSelection(this: TableHost) {
			getInnerTable(this)?.toggleAllSelection?.();
		},
		toggleRowExpansion(this: TableHost, row: unknown, expanded?: boolean) {
			getInnerTable(this)?.toggleRowExpansion?.(row, expanded);
		},
		setCurrentRow(this: TableHost, row: unknown) {
			getInnerTable(this)?.setCurrentRow?.(row);
		},
		clearSort(this: TableHost) {
			getInnerTable(this)?.clearSort?.();
		},
		clearFilter(this: TableHost, columnKey?: string) {
			getInnerTable(this)?.clearFilter?.(columnKey);
		},
		doLayout(this: TableHost) {
			getInnerTable(this)?.doLayout?.();
		},
		sort(this: TableHost, prop: string, order: string) {
			getInnerTable(this)?.sort?.(prop, order);
		},
	},
};
