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

export const forgetPasswordApi = {
	fetchForgetPhoneCode,
	validateForgetCode,
	editForgetPassword,
	fetchForgetPhone,
}
