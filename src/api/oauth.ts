/**
 * OAuth / 社交登录相关接口
 */
import { http, httpGet, httpPost } from '@/axios'

/** 业务系统授权信息（原 oauth.info） */
export function fetchOauthInfo() {
	return httpPost<unknown>('/security/portal/authorize/info')
}

/** 社交登录跳转 URL（原 index.getOauthUrl） */
export function fetchOauthUrl(source: string) {
	return httpGet<unknown>(`/social-auth/oauth/render/${source}`)
}

/** OAuth2 授权（原 oauth.authorize） */
export function fetchOauthAuthorize(params?: Record<string, unknown>) {
	return httpGet<unknown>('/security/oauth2/authorize', params)
}

/** 校验 token（原 oauth.checkToken） */
export function fetchCheckToken(params?: Record<string, unknown>) {
	return http<unknown>({ method: 'post', url: '/oauth/check_token', params })
}

/** 获取授权码（原 oauth.getAuthorizeCode，已弃用） */
export function fetchAuthorizeCode(param?: Record<string, unknown>) {
	return http<unknown>({
		method: 'post',
		url: '/oauth/auth/getAuthorizationCode',
		data: param,
		emulateJSON: true,
	})
}

/** --- loader（与旧版 oauth.js 导出名一致）--- */
export function info() {
	return { url: '/security/portal/authorize/info', method: 'post' }
}

export function authorize(params?: Record<string, unknown>) {
	return { url: '/security/oauth2/authorize', method: 'get', params }
}

export function checkToken(param?: Record<string, unknown>) {
	return { url: '/oauth/check_token', method: 'post', params: param }
}

export function getAuthorizeCode(param?: Record<string, unknown>) {
	return {
		url: '/oauth/auth/getAuthorizationCode',
		method: 'post',
		data: param,
		emulateJSON: true,
	}
}

export const oauthApi = {
	fetchOauthInfo,
	fetchOauthUrl,
	fetchOauthAuthorize,
	fetchCheckToken,
	fetchAuthorizeCode,
}
