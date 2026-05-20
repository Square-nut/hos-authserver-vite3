import { apiRequest } from './api-request'
import type { ApiResult } from '@/types/api-common'

/**
 * 带 ApiResult 类型的请求封装。
 * 仅供过渡期 services/*.ts（loader key）。已迁移请用 api/*.ts + httpGet。
 */
export function request<T = unknown>(
	key: string,
	params?: unknown,
	headers?: Record<string, string>,
): Promise<ApiResult<T>> {
	return apiRequest(key, params, headers) as Promise<ApiResult<T>>
}
