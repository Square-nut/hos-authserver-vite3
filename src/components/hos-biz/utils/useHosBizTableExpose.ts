import type { Ref } from 'vue'
import { EL_TABLE_REF } from '../components/table/index.js'

type TableWrapper = {
	$refs?: Record<string, unknown>
}

export function useHosBizTableExpose(tableComponentRef: Ref<TableWrapper | null>) {
	function getTableRef() {
		return tableComponentRef.value?.$refs?.[EL_TABLE_REF] as {
			clearSelection?: () => void
			toggleRowSelection?: (row: unknown, selected?: boolean) => void
			toggleAllSelection?: () => void
			toggleRowExpansion?: (row: unknown, expanded?: boolean) => void
			setCurrentRow?: (row: unknown) => void
			clearSort?: () => void
			clearFilter?: (columnKey?: string) => void
			doLayout?: () => void
			sort?: (prop: string, order: string) => void
		} | null
	}

	return {
		clearSelection() {
			getTableRef()?.clearSelection?.()
		},
		toggleRowSelection(row: unknown, selected?: boolean) {
			getTableRef()?.toggleRowSelection?.(row, selected)
		},
		toggleAllSelection() {
			getTableRef()?.toggleAllSelection?.()
		},
		toggleRowExpansion(row: unknown, expanded?: boolean) {
			getTableRef()?.toggleRowExpansion?.(row, expanded)
		},
		setCurrentRow(row: unknown) {
			getTableRef()?.setCurrentRow?.(row)
		},
		clearSort() {
			getTableRef()?.clearSort?.()
		},
		clearFilter(columnKey?: string) {
			getTableRef()?.clearFilter?.(columnKey)
		},
		doLayout() {
			getTableRef()?.doLayout?.()
		},
		sort(prop: string, order: string) {
			getTableRef()?.sort?.(prop, order)
		},
	}
}
