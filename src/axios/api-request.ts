import type { AxiosRequestConfig } from 'axios'
import Http, { type HttpOptions } from './http'
import type { ApiResult } from '@/types/api-common'

const apiClient = new Http({
	baseURL:
		import.meta.env.VITE_APP_BASE_URL ||
		import.meta.env.VUE_APP_BASE_URL ||
		'/api',
	timeout: Number(
		import.meta.env.VITE_APP_TIME_OUT ||
			import.meta.env.VUE_APP_TIME_OUT ||
			10000,
	),
	cache: false,
	emulateJSON: false,
})

/** 底层请求入口（loader key）。老代码 / 应急可直接使用。 */
export function apiRequest(
	key: string,
	params?: unknown,
	headers?: Record<string, string>,
): Promise<ApiResult<unknown>> {
	return apiClient.request(key, params, headers) as unknown as Promise<
		ApiResult<unknown>
	>
}

/** 已迁移页面：直接发请求（标准 Vue3 api 模块用） */
export function http<T = unknown>(
	config: HttpOptions,
	headers?: Record<string, string>,
) {
	return apiClient.requestConfig(config, headers) as unknown as Promise<ApiResult<T>>
}

export function httpGet<T = unknown>(
	url: string,
	params?: Record<string, unknown>,
	headers?: Record<string, string>,
) {
	return http<T>({ method: 'get', url, params }, headers)
}

export function httpPost<T = unknown>(
	url: string,
	data?: unknown,
	headers?: Record<string, string>,
) {
	return http<T>({ method: 'post', url, data }, headers)
}

export default apiRequest
