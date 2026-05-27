import type { ApiResult } from '@/types/api-common'

/** 表格 uid，与 el-biz-table :uid 一致 */
export type HosBizUid = string | number

/** 列定义（与 hos-biz tableColumnParser 一致，产线按旧 cols 配置即可） */
export interface ColumnDef {
	label?: string
	prop?: string | ((scope: { row: Record<string, unknown>; column: unknown; $index: number }, h: unknown) => unknown)
	width?: string | number
	minWidth?: string | number
	fixed?: boolean | 'left' | 'right'
	align?: 'left' | 'center' | 'right'
	sortable?: boolean | 'custom'
	sortProp?: string
	type?: 'checkbox' | 'radio' | string
	key?: string
	slotName?: string
	render?: (scope: { row: Record<string, unknown> }, h: unknown) => unknown
	children?: ColumnDef[]
	_show?: boolean
	[key: string]: unknown
}

/** 查询表单配置 */
export interface FormConfig {
	labelWidth?: string | number
	labelPosition?: 'left' | 'right' | 'top'
	model: Record<string, unknown>
	inline?: boolean
	[key: string]: unknown
}

/** 分页配置；false 表示不分页 */
export type PageConfig =
	| false
	| {
			pageSize?: number
			layout?: string
			[key: string]: unknown
	  }

/** table-data / 数据源：返回 Promise，结构由 data-patch-v1 归一化 */
export type TableDataFn<T = unknown> = (
	params: Record<string, unknown>,
) => Promise<ApiResult<T> | { code?: string | number; data?: T; [key: string]: unknown }>

export interface OpenHosBizDialogPayload {
	_uid: HosBizUid
	component: unknown
	props?: Record<string, unknown>
	ref?: string
}

export interface HosBizTableMutationPayload {
	_uid: HosBizUid
	[key: string]: unknown
}
