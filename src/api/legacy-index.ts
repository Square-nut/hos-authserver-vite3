/**
 * 旧版 `src/api/index.js` 中的接口定义（供 loader / `$api('methodName')` 使用）
 * 新代码请使用各域模块的 `fetch*` / `httpGet` / `httpPost`。
 */
import type { AxiosRequestConfig } from 'axios'

type Params = Record<string, unknown> | undefined

export const login = (params: Params & { grantType?: string }) => ({
	url: `/security/token?grantType=${params?.grantType ?? ''}`,
	method: 'post',
	data: params,
})

export const getCaptcha = (_params?: Params) => ({
	url: '/security/captcha',
	method: 'get',
})

export const listMenu = () => ({
	url: '/sys/resources/list-menu',
	method: 'get',
})

export const listConfig = () => ({
	url: '/sys/config/select-init',
	method: 'get',
})

export const getPreLoginData = (params?: Params) => ({
	url: '/auth/pre-auth-data',
	method: 'get',
	params,
})

export const getOauthUrl = (source: string) => ({
	url: `/social-auth/oauth/render/${source}`,
	method: 'get',
})

export const getOTPCode = (params?: Params) => ({
	url: '/security/sms/sendValidate',
	method: 'get',
	params,
})

export const grantChainId = (params?: Params) => ({
	url: '/otp-auth/otp-code/grantChainId',
	method: 'get',
	params,
})

export function logout() {
	return { url: '/security/logout', method: 'post' }
}

export function configPageType(params?: Params) {
	return { url: '/security/loginPage', method: 'get', params }
}

export const licenseState = (params?: Params) => ({
	url: '/security/license/state',
	method: 'get',
	params,
})

export function authType(params?: Params) {
	return { url: '/security/authType', method: 'get', params }
}

export function loginType() {
	return { url: '/security/loginType', method: 'get' }
}

export const languageData = (params?: Params) => ({
	url: '/i18n/element/get-elements',
	method: 'get',
	params,
})

export const getLangs = () => ({
	url: '/i18n/language/list-select',
	method: 'get',
})

export const getLanguages = () => ({
	url: '/i18n/language/select-Language',
	method: 'get',
})

export const loginPageElements = (params?: Params) => ({
	url: '/i18n/element/get-loginPageElements',
	method: 'get',
	params,
})

export const changePost = (data?: Params) => ({
	url: '/security/user/post',
	method: 'post',
	params: data,
})

export const elementAuthList = (params?: Params) => ({
	url: '/sys/page-preset/column-perm/list-perm',
	method: 'get',
	params,
})

export const isOpen = () => ({
	url: '/i18n/config/is-open',
	method: 'get',
})

export const dbDialogShowData = () => ({
	url: '/sys/config/is-open-download-browser',
	method: 'get',
})

export const selectPostPage = (params?: Params) => ({
	url: '/org/hos-post/select-post-page',
	method: 'get',
	params,
})

export const getLoginConfig = (params?: Params) => ({
	url: '/security/loginConfig',
	method: 'get',
	params,
})

export const getI18nConfig = (_params?: Params) => ({
	url: '/i18n/element/get-login-page-config',
	method: 'get',
	params: { moduleCode: 'loginPage' },
})

export type LegacyIndexBuilder = (params?: unknown) => AxiosRequestConfig
