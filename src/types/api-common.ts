/** 与后端约定一致的通用响应外壳（无 OpenAPI 时由前端维护） */
export interface ApiResult<T = unknown> {
	code: string | number
	data?: T
	msg: string
}

/** 业务成功码（兼容 number / string） */
export function isSuccessCode(code: string | number | undefined | null): boolean {
	return code === 200 || code === '200'
}
