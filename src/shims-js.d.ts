declare module '@/utils/validateUtil' {
	export function validPhone11(value: string): boolean
	export function validEmail(value: string): boolean
}

declare module '@/utils/generate-random-string.js' {
	export default function generateRandomString(length?: number): string
}

declare module '@/utils/base/token-util' {
	export function getToken(refresh?: boolean): string | null
}

declare module '@/utils/base/user-store-util' {
	export function getUserInfo(): Record<string, unknown>
	export function getPolicyErrorCode(): string | null
}

declare module '@/utils/theme/themeConfig' {
	const themeConfig: Record<string, Record<string, string>>
	export default themeConfig
}

declare module '@/utils/index' {
	export function deepClone<T>(value: T): T
	export function returnGlobalValue(key: string): unknown
}

declare module '@/utils/permission' {
	export const hasPermi: Record<string, unknown>
	export function isDisabled(key: string): boolean
	export function colAuthFilter(columns: unknown[]): unknown[]
}

declare module '@/utils/permission/index' {
	export const hasPermi: Record<string, unknown>
	export function isDisabled(key: string): boolean
	export function colAuthFilter(columns: unknown[]): unknown[]
}

declare module '@/components/hos-biz/components/form/button' {
	import type { Plugin } from 'vue'
	const plugin: Plugin
	export default plugin
}

declare module '@/components/hos-biz/components/dialog' {
	import type { Plugin } from 'vue'
	const plugin: Plugin
	export default plugin
}

declare module '@/components/hos-biz/components/table/index.js' {
	export const EL_TABLE_REF: string
}

declare module '@/components/hos-biz/components/table' {
	const Table: import('vue').Component
	export default Table
}

declare module '@/components/hos-biz/components/pagination' {
	const Page: import('vue').Component
	export default Page
}

declare module '@/components/hos-biz/components/form' {
	const Form: import('vue').Component
	export default Form
}

declare module '@/components/hos-biz/utils/data-patch-v1/try-get-only-array' {
	export default function tryGetOnlyArray(data: unknown): { data: unknown[] }
}

declare module '@/components/hos-biz/utils/data-patch-v1/try-get-pagination-params' {
	export default function tryGetPaginationParams(data: unknown): { total?: number }
}

declare module '@/components/hos-biz/utils/pinia-bridge' {
	export function tableStoreComputed(): Record<string, unknown>
	export function dialogStoreComputed(): Record<string, unknown>
	export function hosBizUidMatches(storeUid: unknown, instanceUid: unknown): boolean
}

declare module '@/components/hos-biz/utils/store-config' {
	export const timestamp: string
	export const uid: string
	export const event: string
	export const params: string
	export function common(state: Record<string, unknown>, payload: Record<string, unknown>): void
}

declare module '@/components/hos-biz/utils/filter-empty' {
	export default function filterEmpty<T>(value: T): T
}

declare module '@/components/hos-biz/utils/render-label' {
	export default class RenderLabel {
		constructor()
	}
}

declare module '@/views/login/js/login' {
	export function getLoginErrorDesc(code: string, msg?: string): string
}

declare module 'qs' {
	const qs: {
		parse(str: string, options?: Record<string, unknown>): Record<string, string>
		stringify(obj: Record<string, unknown>, options?: Record<string, unknown>): string
	}
	export default qs
}

declare module 'qrcode' {
	export function toDataURL(
		text: string,
		options?: Record<string, unknown>,
	): Promise<string>
	export function toCanvas(
		canvas: HTMLCanvasElement,
		text: string,
		options?: Record<string, unknown>,
		callback?: (error: Error | null) => void,
	): void
}

declare interface Window {
	strServerRan?: string
}
