/**
 * OAuth / 社交登录相关接口
 */
import { http, httpGet, httpPost } from '@/axios'
import type { HttpOptions } from '@/axios/http'

export function fetchOauthInfo() {
	return httpPost<unknown>('/security/portal/authorize/info')
}

export function fetchOauthUrl(source: string) {
	return httpGet<unknown>(`/social-auth/oauth/render/${source}`)
}

export function fetchOauthAuthorize(params?: Record<string, unknown>) {
	return httpGet<unknown>('/security/oauth2/authorize', params)
}

export function fetchCheckToken(params?: Record<string, unknown>) {
	return http<unknown>({ method: 'post', url: '/oauth/check_token', params })
}

export function fetchAuthorizeCode(param?: Record<string, unknown>) {
	return http<unknown>({
		method: 'post',
		url: '/oauth/auth/getAuthorizationCode',
		data: param,
		emulateJSON: true,
	} satisfies HttpOptions)
}

export const oauthApi = {
	fetchOauthInfo,
	fetchOauthUrl,
	fetchOauthAuthorize,
	fetchCheckToken,
	fetchAuthorizeCode,
}
