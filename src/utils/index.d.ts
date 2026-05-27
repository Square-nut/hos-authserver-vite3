/** Type declarations for `src/utils/index.js` */

export function parseTime(
	time: Date | string | number | null | undefined,
	cFormat?: string,
): string | null

export function formatTime(time: string | number, option?: string): string

export function getQueryObject(url?: string | null): Record<string, string>

export function byteLength(str: string): number

export function cleanArray<T>(actual: T[]): T[]

export function param(json: Record<string, unknown>): string

export function param2Obj(url: string): Record<string, string>

export function html2Text(val: string): string

export function objectMerge(
	target: Record<string, unknown>,
	source: Record<string, unknown> | unknown[],
): Record<string, unknown>

export function toggleClass(element: HTMLElement, className: string): void

export function getTime(type?: 'start' | string): number | Date

export function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	delay: number,
	immediate?: boolean,
): (...args: Parameters<T>) => void

export function deepClone<T>(source: T): T

export function uniqueArr<T>(arr: T[]): T[]

export function createUniqueString(): string

export function hasClass(ele: HTMLElement, cls: string): boolean

export function addClass(ele: HTMLElement, cls: string): void

export function removeClass(ele: HTMLElement, cls: string): void

export const escapeRegexpString: (value?: string) => string

/** 读取 `__hos`（environment.js）或 `import.meta.env` 中的配置项 */
export function returnGlobalValue(val: string): unknown

export function getBaseUrl(): unknown

export function isTrue(value: unknown): boolean

export function queryToObj(query: string): Record<string, string>

export function isEmptyValue(value: unknown): boolean

export function getEnv(): unknown

export function isDev(): boolean

export function isForce(): boolean

export function getOs(): string

export function getInternetExplorerVersion(): number

export function getUuid(): string

export function checkIfInIframe(): boolean

export interface MenuNode {
	hidden?: boolean
	visible?: boolean
	withPermission?: boolean
	children?: MenuNode[]
	[key: string]: unknown
}

export function filterMenu(menuList: MenuNode[]): MenuNode[]

export function filterMenus(menuList: MenuNode[]): MenuNode[]

export function BlobDownLoad(
	res: { data: BlobPart; headers: Record<string, string> },
	type?: string,
): void

export function getValue(
	object: Record<string, unknown> | null | undefined,
	path: string | string[],
	defaultValue?: unknown,
): unknown
