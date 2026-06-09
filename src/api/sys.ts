/**
 * 系统配置 / 权限相关接口（/sys）
 */
import { httpGet } from '@/axios'

export function fetchListMenu() {
	return httpGet<unknown>('/sys/resources/list-menu')
}

export function fetchListConfig() {
	return httpGet<unknown>('/sys/config/select-init')
}

export function fetchElementAuthList(params?: Record<string, unknown>) {
	return httpGet<unknown>('/sys/page-preset/column-perm/list-perm', params)
}

export function fetchDbDialogShowData() {
	return httpGet<unknown>('/sys/config/is-open-download-browser')
}

export const sysApi = {
	fetchListMenu,
	fetchListConfig,
	fetchElementAuthList,
	fetchDbDialogShowData,
}
