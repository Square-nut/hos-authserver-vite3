/**
 * 登录 / 安全（/security）相关接口
 */
import { http, httpGet, httpPost } from '@/axios'
import type { LoginConfigData } from '@/types/login-layout'

export type LoginPageType = 'hos' | 'easy'

/** 登录获取 token */
export function login(
	params: Record<string, unknown> & { grantType?: string },
	headers?: Record<string, string>,
) {
	const grantType = params.grantType ?? ''
	return httpPost<unknown>(
		`/security/token?grantType=${grantType}`,
		params,
		headers,
	)
}

/** 图形验证码 */
export function getCaptcha(params?: Record<string, unknown>) {
	return httpGet<{ img: string; uuid: string }>('/security/captcha', params)
}

/** 短信 / OTP 验证码 */
export function getOTPCode(params?: Record<string, unknown>) {
	return httpGet<unknown>('/security/sms/sendValidate', params)
}

/** 退出登录 */
export function logout() {
	return httpPost<unknown>('/security/logout')
}

/** 登录页配置（旧 configPageType） */
export function fetchConfigPageType(params?: Record<string, unknown>) {
	return httpGet<unknown>('/security/loginPage', params)
}

/** 许可证状态 */
export function fetchLicenseState(params?: Record<string, unknown>) {
	return httpGet<unknown>('/security/license/state', params)
}

/** 判断登录方式（302 / 200） */
export function fetchAuthType(params?: Record<string, unknown>) {
	return httpGet<unknown>('/security/authType', params)
}

/** 获取登录方式 */
export function fetchLoginType() {
	return httpGet<unknown>('/security/loginType')
}

/** 切换岗位 */
export function changePost(data: Record<string, unknown>) {
	return http<unknown>({
		method: 'post',
		url: '/security/user/post',
		params: data,
	})
}

/** 登录配置（loginType + loginPage） */
export function fetchLoginConfig(pageType: LoginPageType) {
	return httpGet<LoginConfigData>('/security/loginConfig', { pageType })
}

export const loginApi = {
	login,
	getCaptcha,
	getOTPCode,
	logout,
	fetchConfigPageType,
	fetchLicenseState,
	fetchAuthType,
	fetchLoginType,
	changePost,
	fetchLoginConfig,
}
