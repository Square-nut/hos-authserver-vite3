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

/** POST，参数走 query（与旧版 ca.authPinPhone 一致） */
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

/** --- loader（与旧版 ca.js 导出名一致）--- */
export function getQRData(params?: Record<string, unknown>) {
	return { url: '/security/ca/getQRData', method: 'get', params }
}

export function getQRResultData(params?: Record<string, unknown>) {
	return { url: '/security/ca/getQRResultData', method: 'get', params }
}

export function getCAInitParams(params?: Record<string, unknown>) {
	return { url: '/security/ca/getCAInitParams', method: 'get', params }
}

export function authPinPhone(param?: Record<string, unknown>) {
	return { url: '/security/ca/authPinPhone', method: 'post', params: param }
}

export function getSupportCAType(param?: Record<string, unknown>) {
	return { url: '/ca-auth/getSupportCAType', params: param }
}

export function getCAOpenFlag(data?: Record<string, unknown>) {
	return { url: '/security/getCAOpenFlag', method: 'post', data }
}

export function caAuth(data?: Record<string, unknown>) {
	return { url: '/security/caAuth', method: 'post', data }
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
