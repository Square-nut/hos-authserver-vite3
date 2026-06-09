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
			ref="tableRef"
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
				ref="selectRef"
				class="select-table-v2-popover-select"
				v-bind="$attrs"
				v-model="defaultValue"
				:disabled="disabled"
				:suffix-icon="GRID_ICON"
				popper-class="select-table-v2-dropdown-select"
				@visible-change="onSelectVisibleChange"
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

<script setup lang="ts">
import {
	computed,
	markRaw,
	nextTick,
	onMounted,
	ref,
	useAttrs,
	watch,
} from 'vue'
import { Briefcase, Grid } from '@element-plus/icons-vue'
import { useHosBizTableStore } from '@/stores/hosBizTable'
import { UI_THEME } from '@/constants/ui-theme'

defineOptions({ name: 'HosBizSelectTable2', inheritAttrs: false })

const GRID_ICON = markRaw(Grid)

const props = withDefaults(
	defineProps<{
		modelValue?: string | number | unknown[]
		value?: string | number | unknown[]
		multiple?: boolean
		valueConfig?: { label: string; value: string }
		cols?: Record<string, unknown>[]
		page?: Record<string, unknown> | boolean
		form?: Record<string, unknown>
		disabled?: boolean
		tableData?: unknown
		uid: string | number
		rowClassName?: string | ((...args: unknown[]) => string)
		rowDisabledMethod?: (row: Record<string, unknown>) => boolean
		dropdownWidth?: number
		init?: boolean
		selectPrefix?: boolean
	}>(),
	{
		multiple: false,
		valueConfig: () => ({ label: 'label', value: 'value' }),
		cols: () => [],
		disabled: false,
		rowDisabledMethod: () => false,
		init: true,
		selectPrefix: true,
	},
)

const emit = defineEmits<{
	'update:modelValue': [val: unknown]
	input: [val: unknown]
	change: [val: unknown]
}>()

const attrs = useAttrs()
const tableStore = useHosBizTableStore()

const isHosTheme = UI_THEME === 1
const defaultValue = ref<string | number | unknown[]>(
	props.multiple ? [] : '',
)
const selectRows = ref<Record<string | number, Record<string, unknown>>>({})
const currentTableData = ref<Record<string, unknown>[]>([])
const popoverWidth = ref('500px')
const visible = ref(false)
const selectLabel = ref('')
const selectRef = ref<{ $el?: HTMLElement; blur?: () => void } | null>(null)
const tableRef = ref<{ tableData?: Record<string, unknown>[]; fitHeight?: (h: number) => void } | null>(null)

const resolvedTableData = computed(() => {
	if (props.tableData !== undefined && props.tableData !== null) {
		return props.tableData
	}
	return (attrs.tableData ?? attrs['table-data']) as unknown
})

const tableUID = computed(() => `${props.uid}-select-table-dropdown-table`)
const valueKey = computed(() => props.valueConfig!.value)
const labelKey = computed(() => props.valueConfig!.label)

function syncSelectLabel(val: unknown) {
	if (props.multiple || Array.isArray(val)) return
	const target = currentTableData.value.find(
		(ele) => ele[valueKey.value] == val,
	)
	selectLabel.value = target ? String(target[labelKey.value] ?? '') : ''
}

function syncFromProp(val: unknown) {
	defaultValue.value = (
		val !== undefined && val !== null ? val : props.multiple ? [] : ''
	) as string | number | unknown[]
	syncSelectLabel(defaultValue.value)
}

watch(
	() => props.modelValue,
	(val) => syncFromProp(val),
	{ immediate: true },
)

watch(
	() => props.value,
	(val) => {
		if (props.modelValue === undefined || props.modelValue === null) {
			syncFromProp(val)
		}
	},
	{ immediate: true },
)

function emitModel(val: unknown) {
	emit('update:modelValue', val)
	emit('input', val)
	emit('change', val)
}

function initTable() {
	if (props.multiple === true) {
		props.cols!.splice(0, 0, {
			type: 'selection',
			width: '50',
			align: 'center',
		})
	}
}

function rowClick(row: Record<string, unknown>) {
	if (props.rowDisabledMethod!(row)) return
	if (props.multiple) {
		return
	}
	const value = row[props.valueConfig!.value]
	selectRows.value = { [String(value)]: row }
	defaultValue.value = row[props.valueConfig!.value] as string | number
	selectLabel.value = String(row[props.valueConfig!.label] ?? '')
	selectRef.value?.blur?.()
	emitModel(defaultValue.value)
	visible.value = false
}

function select(rows: Record<string, unknown>[], row: Record<string, unknown>) {
	const isSelect = rows.length && rows.indexOf(row) !== -1
	const key = row[props.valueConfig!.value] as string | number
	if (isSelect) {
		selectRows.value[key] = row
		;(defaultValue.value as unknown[]).push(key)
	} else {
		delete selectRows.value[key]
		const arr = defaultValue.value as unknown[]
		defaultValue.value = arr.filter((item) => item !== key)
	}
	findLabel()
	emitModel(defaultValue.value)
}

function selectAll(rows: Record<string, unknown>[]) {
	const isAllSelect = rows.length > 0
	if (isAllSelect) {
		rows.forEach((row) => {
			const key = row[props.valueConfig!.value] as string | number
			selectRows.value[key] = row
			const arr = defaultValue.value as unknown[]
			if (!arr.find((item) => item === key)) {
				arr.push(key)
			}
		})
	} else {
		const tableData = tableRef.value?.tableData ?? []
		tableData.forEach((row) => {
			const key = row[props.valueConfig!.value]
			delete selectRows.value[key as string | number]
			const arr = defaultValue.value as unknown[]
			const index = arr.findIndex((item) => item === key)
			if (index !== -1) arr.splice(index, 1)
		})
	}
	findLabel()
	emitModel(defaultValue.value)
}

function findLabel() {
	const row = selectRows.value[defaultValue.value as string | number]
	if (row) {
		selectLabel.value = String(row[props.valueConfig!.label] ?? '')
	}
}

function tableLoadAfter(data: Record<string, unknown>[]) {
	currentTableData.value = data
}

function onSelectVisibleChange(open: boolean) {
	if (open) {
		selectRef.value?.blur?.()
	} else if (defaultValue.value) {
		findLabel()
	}
}

function refresh() {
	tableStore.UPDATE_TABLE({ _uid: tableUID.value })
}

function fitHeight(height: number) {
	tableRef.value?.fitHeight?.(height)
}

initTable()

onMounted(() => {
	nextTick(() => {
		const el = selectRef.value?.$el
		if (el) popoverWidth.value = `${el.offsetWidth}px`
		if (props.dropdownWidth) popoverWidth.value = `${props.dropdownWidth}px`
	})
})

defineExpose({ refresh, fitHeight })
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
	.el-select__prefix {
		left: 0;
		right: auto;
	}
}

.select-table-v2-popover-select {
	.el-select__suffix .el-icon {
		color: #909399;
		font-size: 16px;
	}
}
</style>
