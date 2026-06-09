/**
 * CA 登录相关接口
 */
import { http, httpGet } from '@/axios'

export function fetchQRData(params?: Record<string, unknown>) {
	return httpGet<unknown>('/security/ca/getQRData', params)
}

export function fetchQRResultData(params?: Record<string, unknown>) {
	return httpGet<unknown>('/security/ca/getQRResultData', params)
}

export function fetchCAInitParams(params?: Record<string, unknown>) {
	return httpGet<unknown>('/security/ca/getCAInitParams', params)
}

/** POST，参数走 query */
export function fetchAuthPinPhone(params?: Record<string, unknown>) {
	return http<unknown>({ method: 'post', url: '/security/ca/authPinPhone', params })
}

export function fetchSupportCAType(params?: Record<string, unknown>) {
	return httpGet<unknown>('/ca-auth/getSupportCAType', params)
}

export function fetchCAOpenFlag(data?: Record<string, unknown>) {
	return http<unknown>({ method: 'post', url: '/security/getCAOpenFlag', data })
}

export function fetchCaAuth(data?: Record<string, unknown>) {
	return http<unknown>({ method: 'post', url: '/security/caAuth', data })
}

export const caApi = {
	fetchQRData,
	fetchQRResultData,
	fetchCAInitParams,
	fetchAuthPinPhone,
	fetchSupportCAType,
	fetchCAOpenFlag,
	fetchCaAuth,
}
