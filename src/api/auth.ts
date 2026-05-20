/**
 * 登录前 / OTP 等认证辅助接口
 */
import { httpGet } from '@/axios'

/** 登录前数据 */
export function fetchPreLoginData(params?: Record<string, unknown>) {
	return httpGet<unknown>('/auth/pre-auth-data', params)
}

/** OTP 链路 grantChainId */
export function fetchGrantChainId(params?: Record<string, unknown>) {
	return httpGet<unknown>('/otp-auth/otp-code/grantChainId', params)
}

export const authApi = {
	fetchPreLoginData,
	fetchGrantChainId,
}
