/**
 * 国际化相关接口（/i18n）
 */
import { httpGet } from '@/axios'
import type { LangOption } from '@/types/login-layout'

/** 是否开启国际化 */
export function fetchI18nIsOpen() {
	return httpGet<boolean>('/i18n/config/is-open')
}

/** 语言下拉 */
export function fetchLangList() {
	return httpGet<LangOption[]>('/i18n/language/list-select')
}

/** 登录页 i18n 文案 */
export function fetchLoginPageElements(moduleCode = 'loginPage') {
	return httpGet<Record<string, string>>('/i18n/element/get-loginPageElements', {
		moduleCode,
	})
}

/** 页面语言包（通用模块文案） */
export function fetchLanguageData(params?: Record<string, unknown>) {
	return httpGet<Record<string, string>>('/i18n/element/get-elements', params)
}

/** 语言选择（另一套下拉） */
export function fetchLanguages() {
	return httpGet<unknown>('/i18n/language/select-Language')
}

/** 登录页 i18n 配置（原 getI18nConfig / `$api('getI18nConfig')`） */
export function fetchI18nLoginPageConfig() {
	return httpGet<{
		languageList?: LangOption[]
		pageElements?: Record<string, string>
	}>('/i18n/element/get-login-page-config', { moduleCode: 'loginPage' })
}

/** loader：`i18n.getI18nConfig` */
export function getI18nConfig() {
	return {
		url: '/i18n/element/get-login-page-config',
		method: 'get',
		params: { moduleCode: 'loginPage' },
	}
}

export const i18nApi = {
	fetchI18nIsOpen,
	fetchLangList,
	fetchLoginPageElements,
	fetchLanguageData,
	fetchLanguages,
	fetchI18nLoginPageConfig,
}
