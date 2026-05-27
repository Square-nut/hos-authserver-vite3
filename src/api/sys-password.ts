/**
 * 密码策略与修改
 */
import { httpGet, httpPost } from '@/axios'

export function changePassword(params?: Record<string, unknown>) {
	return httpPost<unknown>('/security/update/password', params)
}

export function fetchPwdPolicy() {
	return httpGet<unknown>('/security/select-password-complex')
}

export function useLastPassword(data?: Record<string, unknown>) {
	return httpPost<unknown>('/security/continue/password', data)
}

export function fetchForcingPwdPolicy() {
	return httpGet<unknown>('/security/select-password-complex')
}

export function validateOldPassword1(param?: Record<string, unknown>) {
	return httpPost<unknown>('/AuthPassword/check-old-password', param)
}

export function validateOldPassword2(param?: Record<string, unknown>) {
	return httpPost<unknown>(
		'/updatePassword/AuthForcingPasswprd/check-old-password',
		param,
	)
}

/** --- loader（与旧版 sys-password.js 一致）--- */
export function getPwdPolicy() {
	return { url: '/security/select-password-complex', method: 'get' }
}

export function useLastPwd(data?: Record<string, unknown>) {
	return { url: '/security/continue/password', method: 'post', data }
}

export function ForcinggetPwdPolicy() {
	return { url: '/security/select-password-complex', method: 'get' }
}

export const sysPasswordApi = {
	changePassword,
	fetchPwdPolicy,
	useLastPassword,
	fetchForcingPwdPolicy,
	validateOldPassword1,
	validateOldPassword2,
}
