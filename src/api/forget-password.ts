/**
 * 忘记密码
 */
import { httpGet, httpPost } from '@/axios'

export function fetchForgetPhoneCode(params?: Record<string, unknown>) {
	return httpGet<unknown>('/security/sms/sendValidate', params)
}

export function validateForgetCode(data?: Record<string, unknown>) {
	return httpPost<unknown>('/security/forget/check-sms', data)
}

export function editForgetPassword(data?: Record<string, unknown>) {
	return httpPost<unknown>('/security/forget/password', data)
}

export function fetchForgetPhone(loginName: string) {
	return httpGet<unknown>('/security/forget/get-phone', { loginName })
}

/** --- loader（与旧版 forget-password.js 一致）--- */
export function getPhoneCode(params?: Record<string, unknown>) {
	return { url: '/security/sms/sendValidate', method: 'get', params }
}

export function editPass(data?: Record<string, unknown>) {
	return { url: '/security/forget/password', method: 'post', data }
}

export function getPhone(params?: { loginName?: string }) {
	const loginName = params?.loginName ?? ''
	return {
		url: `/security/forget/get-phone?loginName=${loginName}`,
		method: 'get',
	}
}

export const forgetPasswordApi = {
	fetchForgetPhoneCode,
	validateForgetCode,
	editForgetPassword,
	fetchForgetPhone,
}
