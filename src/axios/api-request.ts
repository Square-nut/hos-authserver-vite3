import Http, { type HttpOptions } from './http'
import type { ApiResult } from '@/types/api-common'

const apiClient = new Http({
	baseURL: import.meta.env.VITE_APP_BASE_URL || '/api',
	timeout: Number(import.meta.env.VITE_APP_TIME_OUT || 10000),
	cache: false,
	emulateJSON: false,
})

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
