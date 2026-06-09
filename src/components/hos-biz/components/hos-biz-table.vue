<!-- /* 
  * @Author: liruiqing@mediway.cn 
  * @Date: 2022-03-12 10:56:42 
  * @Last Modified by: liruiqing@mediway.cn
  * @Last Modified time: 2024-08-29 16:13:36
*/ -->
<template>
  <div class="el-biz-table" :class="{ flex: isFit, 'pagination-pos-bottom': pagePos === 'bottom', chrome49 }">
    <div :class="{ mb15: !showToolbar && uiStyle == 1, 'el-biz-form': $slots.form }" v-if="form">
      <Form ref="formRef" v-bind="formProps" :uid="uid" :query-cache="queryCache" @reset="reset" @search="search">
        <slot name="form"></slot>
      </Form>
    </div>
    <slot name="top"></slot>
    <div class="el-biz-toolbar" v-if="showToolbar">
      <div class="el-biz-toolbar-left" v-if="$slots.toolbar">
        <slot name="toolbar"></slot>
      </div>
      <div v-if="pagePos === 'top' && page !== false" class="el-biz-toolbar-right el-biz-pagination">
        <Page
          v-bind="pageConfig"
          :query-cache="queryCache"
          class="fr"
          :uid="uid"
          :total="total ?? 0"
          size="mini"
          ref="pageTopRef"
          @current-change="currentChange"
          @size-change="sizeChange"
        ></Page>
      </div>
      <div class="top-toolbar-table-setting" v-if="columnSelected">
        <el-popover placement="bottom" :width="100" trigger="click">
          <div class="top-toolbar-table-setting-content">
            <div
              v-for="(item, index) in cols"
              :key="index"
              class="top-toolbar-table-setting-item"
              :class="{ none: item.none }"
            >
              <el-checkbox
                v-model="selectedInFilteredColumn"
                :label="item.columnSelectedKey"
                @change="changeFilteredColumn"
                >{{ item.columnSelectedLabel }}</el-checkbox
              >
            </div>
          </div>
          <template #reference>
            <el-icon class="top-toolbar-table-setting-icon"><Setting /></el-icon>
          </template>
        </el-popover>
      </div>
    </div>
    <!-- style="min-height: 200px;" 解决resize事件表格导致页面卡死问题 -->
    <Table
      v-bind="$attrs"
      v-loading="tableIsLoading"
      :uid="uid"
      :data="tableData"
      :asyncSlot="asyncSlot"
      :cols="selectedCols"
      :height="height"
      ref="tableComponentRef"
      @sort-change="sortChange"
      @current-change="convertCurrentChange"
      :border="border"
      :stripe="stripe"
      style="min-height: 200px"
      :class="{
        'table--top': !$slots.toolbar || !showToolbar,
        'table--bottom': page === false || (page && pagePos !== 'bottom')
      }"
    >
      <!-- 表格默认插槽 -->
      <slot></slot>
    </Table>
    <slot name="bottom"></slot>
    <div v-if="page !== false && pagePos === 'bottom'" class="el-biz-pagination clearfix">
      <!-- <slot name="page"></slot> -->
      <Page
        ref="pageRef"
        class="simple-pagination"
        v-bind="pageConfig"
        :query-cache="queryCache"
        :uid="uid"
        :total="total ?? 0"
        @current-change="currentChange"
        @size-change="sizeChange"
        :prev-text="uiStyle == 0 ? $t('el.pagination.prev') : null"
        :next-text="uiStyle == 0 ? $t('el.pagination.next') : null"
      >
        <el-icon class="btn-refresh" @click="refresh"><Refresh /></el-icon>
      </Page>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
	computed,
	getCurrentInstance,
	nextTick,
	onBeforeUnmount,
	onMounted,
	provide,
	reactive,
	ref,
	useAttrs,
	useSlots,
	watch,
} from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { Refresh, Setting } from '@element-plus/icons-vue'
import Table from './table'
import Page from './pagination'
import Form from './form'
import tryGetOnlyArray from '../utils/data-patch-v1/try-get-only-array'
import tryGetPaginationParams from '../utils/data-patch-v1/try-get-pagination-params'
import { useHosBizTableStore, subscribeHosBizTableMutations } from '@/stores/hosBizTable'
import { hosBizUidMatches } from '../utils/pinia-bridge'
import { timestamp, uid, event, params } from '../utils/store-config'
import { isSuccessCode } from '@/types/api-common'
import filterEmpty from '../utils/filter-empty'
import Sortable from 'sortablejs'
import RenderLabel from '../utils/render-label'
import { v4 as uuidv4 } from 'uuid'
import { deepClone, returnGlobalValue } from '@/utils/index'
import { UI_THEME } from '@/constants/ui-theme'
import { useHosBizTableExpose } from '../utils/useHosBizTableExpose'

defineOptions({ name: 'HosBizTable' })

const props = withDefaults(
	defineProps<{
		border?: boolean
		stripe?: boolean
		uid?: string | number
		data: unknown
		init?: boolean
		form?: Record<string, unknown> | boolean
		page?: Record<string, unknown> | boolean
		pageTotal?: number
		pagePos?: string
		props?: { data?: string; total?: string }
		dragable?: boolean
		columnSelected?: boolean
		cols: Array<{
			hidden?: boolean
			none?: boolean
			columnSelectedKey?: string
			columnSelectedLabel?: string
			[key: string]: unknown
		}>
		isFit?: boolean
		queryCache?: boolean
		autoPageSize?: boolean
		tableHeight?: number | string
	}>(),
	{
		border: true,
		stripe: () => UI_THEME != 2,
		uid: 0,
		init: true,
		pagePos: 'bottom',
		props: () => ({
			data: 'records',
			total: 'total',
		}),
		isFit: true,
		queryCache: false,
		autoPageSize: false,
	},
)

const emit = defineEmits<{
	search: [params: Record<string, unknown>]
	reset: [params: Record<string, unknown>]
	'size-change': [size: number]
	'current-change': [current: number]
	'page-current-change': [current: number]
	'after-load': [data: unknown[]]
	drag: [newIndex: number, oldIndex: number, row: unknown]
	'current-row-change': [currentRow: unknown, oldCurrentRow: unknown]
}>()

const attrs = useAttrs()
const slots = useSlots()

const hosBizTableStore = useHosBizTableStore()
storeToRefs(hosBizTableStore)

const sTimestamp = computed(() => hosBizTableStore[timestamp])
const sUID = computed(() => hosBizTableStore[uid])
const sEvent = computed(() => hosBizTableStore[event])
const sParams = computed(() => hosBizTableStore[params] as Record<string, unknown>)

const formRef = ref<{ getParams: () => Promise<Record<string, unknown>> } | null>(null)
const pageRef = ref<{ getParams: () => Promise<Record<string, unknown>> } | null>(null)
const pageTopRef = ref<{ getParams: () => Promise<Record<string, unknown>> } | null>(null)
const tableComponentRef = ref<{ $refs?: Record<string, unknown>; $el?: HTMLElement } | null>(null)

const tableExposeMethods = useHosBizTableExpose(tableComponentRef)

const unsubscribe = ref<(() => void) | null>(null)
const chrome49 = ref(false)
const uiStyle = UI_THEME
const selectedInFilteredColumn = ref<string[]>([])
const dragTableBody = ref<HTMLElement | null>(null)
const paramsState = reactive<{ form: Record<string, unknown>; pagination: Record<string, unknown> }>({
	form: {},
	pagination: {},
})
const tableData = ref<unknown[]>([])
const tableIsLoading = ref(false)
const total = ref<number | undefined>(undefined)
const height = ref<number | string | undefined>(undefined)

const instance = getCurrentInstance()
provide('TABLE_PROVIDE', instance?.proxy ?? instance)

const formItems = computed(() => {
	try {
		const form = props.form as { model?: Record<string, unknown> }
		return Object.keys(form.model || {})
	} catch {
		return []
	}
})

const asyncSlot = computed(() => {
	const slotArr = ['form', 'page', 'top', 'bottom']
	const _slot: Record<string, unknown> = {}
	Object.keys(slots)
		.filter((ele) => !slotArr.includes(ele))
		.forEach((ele) => {
			_slot[ele] = slots[ele]
		})
	return _slot
})

const pageConfig = computed(() => {
	const simple = 'ssizes, home, prev, spager, next, end, slot, stotal'
	const hos = 'jumper, home, prev, pager, next, end, ssizes, total'
	const pure = 'stotal, ssizes, prev, pager, next, jumper'
	let config: Record<string, unknown> = {
		layout: uiStyle == 0 ? simple : uiStyle == 1 ? hos : pure,
		total: total.value ?? 0,
		currentPage: paramsState.pagination.current,
		pageSize: paramsState.pagination.size,
		pagerCount: 5,
	}
	if (Object.prototype.toString.call(props.page) === '[object Object]') {
		config = { ...config, ...(props.page as Record<string, unknown>) }
	}
	if (props.autoPageSize) {
		const rowNum = getRowNum()
		if (rowNum) {
			config.pageSize = rowNum
			if (config.pageSize && Array.isArray(config.pageSize)) {
				;(config.pageSize as number[]).unshift(rowNum)
			}
		}
	}
	return config
})

const selectedCols = computed(() => {
	return (props.cols as Array<{ hidden?: boolean }>).filter((ele) => ele.hidden !== true)
})

const showToolbar = computed(
	() =>
		(props.page !== false && props.pagePos === 'top') ||
		!!slots.toolbar ||
		props.columnSelected,
)

const formProps = computed(() =>
	props.form && typeof props.form === 'object'
		? (props.form as Record<string, unknown>)
		: {},
)

function isOkResponse(code: unknown) {
	return isSuccessCode(code as string | number | undefined | null)
}

function tableUidMatches(storeUid: unknown) {
	return hosBizUidMatches(storeUid as string | number, props.uid)
}

function isChrome49() {
	if (navigator.userAgent.includes('Chrome/49')) {
		chrome49.value = true
	}
}

function setTableData(response: { data?: Record<string, unknown>; [key: string]: unknown }) {
	const data = (response.data || response) as Record<string, unknown>
	tableIsLoading.value = false
	let rows = data[props.props!.data!]
	let totalVal = data[props.props!.total!]
	const parseTotal = parseInt(String(totalVal))
	if (typeof parseTotal === 'number' && !Number.isNaN(parseTotal)) totalVal = parseTotal
	if (!Array.isArray(rows)) {
		rows = tryGetOnlyArray(data).data
	}
	if (typeof totalVal !== 'number') {
		totalVal = tryGetPaginationParams(data).total
	}
	tableData.value = rows as unknown[]
	total.value = totalVal as number
}

function parseData(params: Record<string, unknown>) {
	const _params = filterEmpty(params)
	if (typeof props.data === 'function') {
		tableIsLoading.value = true
		return (props.data as (p: Record<string, unknown>) => Promise<{ code?: unknown; msg?: string; data?: Record<string, unknown> }>)(_params)
			.then((response) => {
				if (isOkResponse(response?.code)) {
					setTableData(response as { data?: Record<string, unknown> })
				} else {
					response?.msg && ElMessage.error(response.msg)
					total.value = 0
					tableIsLoading.value = false
					tableData.value = []
				}
			})
			.catch(() => {
				total.value = 0
				tableIsLoading.value = false
				tableData.value = []
			})
			.finally(() => {
				emit('after-load', tableData.value || [])
				nextTick(() => {
					tableExposeMethods.doLayout()
				})
			})
	}
}

function change() {
	if (props.autoPageSize) {
		const rowNum = getRowNum()
		if (rowNum) {
			paramsState.pagination.size = rowNum
		}
	}
	if (Array.isArray(props.data)) {
		tableData.value = props.data
		if ((sParams.value as { type?: string })?.type !== 'reset') {
			tableIsLoading.value = false
		}
		total.value = props.pageTotal || tableData.value.length
		emit('after-load', tableData.value || [])
		nextTick(() => {
			tableExposeMethods.doLayout()
		})
	} else {
		paramsState.pagination.size = paramsState.pagination.size || 10
		paramsState.pagination.current = paramsState.pagination.current || 1
		const sParamsVal = sParamsFilter(sParams.value as Record<string, unknown>)
		return parseData({
			...paramsState.form,
			...paramsState.pagination,
			...sParamsVal,
		})
	}
}

function sParamsFilter(sParamsRaw: Record<string, unknown>) {
	const sParamsCopy = deepClone(sParamsRaw)
	return (sParamsCopy[props.uid] as Record<string, unknown>) || {}
}

function search(params: Record<string, unknown>) {
	paramsState.form = {
		...paramsState.form,
		...params,
	}
	resetPage()
	if (attrs.onSearch) {
		return emit('search', params)
	}
	return change()
}

function reset(params: Record<string, unknown>) {
	paramsState.form = params
	emit('reset', params)
}

function sizeChange(size: number) {
	paramsState.pagination.size = size
	paramsState.pagination.current = 1
	change()
	emit('size-change', size)
}

function currentChange(current: number) {
	paramsState.pagination.current = current
	change()
	emit('current-change', current)
	emit('page-current-change', current)
}

async function getData(isReset = true) {
	try {
		const pageComponent = pageRef.value || pageTopRef.value
		if (props.page !== false && pageComponent) {
			paramsState.pagination = await pageComponent.getParams()
		}
		if (props.form && formRef.value) {
			paramsState.form = await formRef.value.getParams()
		}
		if (isReset) resetPage()
		return change()
	} catch (error) {
		if (returnGlobalValue('NODE_ENV') === 'development') console.error('table debugger:', error)
	}
}

function rowDrop() {
	const tableRoot = tableComponentRef.value?.$el
	dragTableBody.value = tableRoot?.querySelector('.el-table__body-wrapper tbody') ?? null
	if (!dragTableBody.value) return
	Sortable.create(dragTableBody.value, {
		onEnd(evt) {
			const { newIndex, oldIndex } = evt
			if (newIndex == null || oldIndex == null) return
			const currRow = tableData.value.splice(oldIndex, 1)[0]
			emit('drag', newIndex, oldIndex, currRow)
			tableData.value.splice(newIndex, 0, currRow)
		},
	})
}

function setFilteredColumn() {
	const renderLabel = new RenderLabel()
	;(props.cols as Array<Record<string, unknown>>).forEach((element) => {
		if (!element.hidden) element.hidden = false
		element.none = typeof element.label === 'undefined'
		const _label = renderLabel.getLabel(element.label)
		if (!element.columnSelectedKey) {
			element.columnSelectedKey = uuidv4()
			element.columnSelectedLabel = _label
		}
	})
	selectedInFilteredColumn.value = (props.cols as Array<{ hidden?: boolean; columnSelectedKey?: string }>)
		.filter((ele) => !ele.hidden)
		.map((ele) => ele.columnSelectedKey as string)
}

function refresh() {
	useHosBizTableStore().UPDATE_TABLE({ _uid: props.uid })
}

function resetPage() {
	if (props.queryCache) {
		// noop
	} else if (Object.prototype.toString.call(props.page) === '[object Object]') {
		const pageObj = props.page as { currentPage?: number; pageSize?: number }
		paramsState.pagination.current = pageObj.currentPage || 1
		paramsState.pagination.size = pageObj.pageSize || 10
	} else {
		paramsState.pagination.current = 1
	}
}

function changeFilteredColumn() {
	;(props.cols as Array<{ hidden?: boolean; columnSelectedKey?: string }>).forEach((element) => {
		element.hidden = !selectedInFilteredColumn.value.includes(element.columnSelectedKey as string)
	})
}

async function sortChange({
	column,
	prop,
	order,
}: {
	column: { sortable?: string | boolean }
	prop: string
	order: string | null
}) {
	if (props.form && formRef.value) {
		paramsState.form = await formRef.value.getParams()
	}
	if (column.sortable === 'custom') {
		paramsState.form.sort = prop
		paramsState.form.order = order
		if (order === 'ascending') {
			paramsState.form.order = 'asc'
		} else if (order === 'descending') {
			paramsState.form.order = 'desc'
		} else {
			delete paramsState.form.sort
			delete paramsState.form.order
		}
		change()
	}
}

function fitHeight(tableHeight?: number | string) {
	if (tableHeight) {
		height.value = tableHeight
	} else {
		const element = tableComponentRef.value?.$el
		if (!element) return
		height.value = element.offsetHeight
	}
	nextTick(() => {
		tableExposeMethods.doLayout()
	})
}

function getRowNum() {
	if (props.isFit && tableComponentRef.value) {
		let rowHeight: number
		let headRowHeight: number
		let sumRowHeight: number
		if (uiStyle == 0) {
			rowHeight = 32
			headRowHeight = 32
			sumRowHeight = attrs['show-summary'] !== undefined ? 32 : 0
		} else {
			rowHeight = 42
			headRowHeight = 53
			sumRowHeight = attrs['show-summary'] !== undefined ? 44 : 0
		}
		const tableHeightVal = tableComponentRef.value.$el?.offsetHeight ?? 0
		return Math.floor((tableHeightVal - headRowHeight - sumRowHeight) / rowHeight)
	}
	return null
}

function convertCurrentChange(currentRow: unknown, oldCurrentRow: unknown) {
	emit('current-row-change', currentRow, oldCurrentRow)
}

watch(
	() => props.page,
	(val, oldVal) => {
		if (oldVal && val && typeof val === 'object' && (val as { currentPage?: number }).currentPage != null) {
			const pageVal = val as { currentPage?: number }
			const oldPageVal = oldVal as { currentPage?: number }
			if (pageVal.currentPage != oldPageVal.currentPage) {
				paramsState.pagination.current = pageVal.currentPage
			}
		}
	},
	{ deep: true },
)

watch(
	() => props.cols,
	() => {
		setFilteredColumn()
	},
)

onMounted(() => {
	unsubscribe.value = subscribeHosBizTableMutations((type) => {
		if (type === 'UPDATE_TABLE') {
			if (tableUidMatches(sUID.value) || (sUID.value === 0 && sEvent.value === 'update')) {
				if ((sParams.value as { type?: string })?.type === 'reset') {
					tableIsLoading.value = true
				}
				nextTick(() => {
					getData()
				})
			}
		} else if (type === 'REFRESH_TABLE') {
			if (tableUidMatches(sUID.value) || (sUID.value === 0 && sEvent.value === 'refresh')) {
				if ((sParams.value as { type?: string })?.type === 'reset') {
					tableIsLoading.value = true
				}
				nextTick(() => {
					getData(false)
				})
			}
		}
	})
	isChrome49()

	if (props.init) {
		getData()
	} else {
		tableData.value = Array.isArray(props.data) ? props.data : tableData.value
		total.value = tableData.value?.length || 0
		emit('after-load', tableData.value)
		nextTick(() => {
			tableExposeMethods.doLayout()
		})
	}
	if (props.dragable) {
		rowDrop()
	}
	if (props.columnSelected) {
		setFilteredColumn()
	}
	if (props.isFit) {
		fitHeight()
	}
})

onBeforeUnmount(() => {
	unsubscribe.value?.()
})

defineExpose({
	tableData,
	getData,
	search,
	reset,
	refresh,
	fitHeight,
	change,
	parseData,
	...tableExposeMethods,
})
</script>
<style lang="scss" scoped>
.el-biz-table {
  flex-direction: column;
  height: 100%;
  background: transparent;
  &.flex {
    display: flex;
  }
  :deep(.el-table__body-wrapper) {
    outline: none;
  }
  :deep(.el-table__fixed) {
    pointer-events: none;
    & > * {
      pointer-events: auto;
    }
  }
}
.none {
  display: none;
}
.top-toolbar-table-setting-icon {
  font-size: 18px;
  color: #606266;
  cursor: pointer;
}
</style>

<style lang="scss">
.chrome49.el-biz-table {
  .el-pagination button,
  .el-pagination span:not([class*='suffix']) {
    line-height: 31px;
  }
  .el-pagination span.el-pagination__sizes:not([class*='suffix']) {
    line-height: 26px;
  }
}
.el-biz-table .el-biz-pagination .el-pagination__sizes .el-input__suffix .el-input__validateIcon {
  display: none;
}
</style>
