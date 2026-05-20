/**
 * 系统配置 / 权限相关接口（/sys）
 */
import { httpGet } from '@/axios'

/** 获取资源菜单 */
export function fetchListMenu() {
	return httpGet<unknown>('/sys/resources/list-menu')
}

/** 登录成功后初始化配置 */
export function fetchListConfig() {
	return httpGet<unknown>('/sys/config/select-init')
}

/** 预制页面列权限 */
export function fetchElementAuthList(params?: Record<string, unknown>) {
	return httpGet<unknown>('/sys/page-preset/column-perm/list-perm', params)
}

/** 医为下载浏览器弹窗是否开启 */
export function fetchDbDialogShowData() {
	return httpGet<unknown>('/sys/config/is-open-download-browser')
}

export const sysApi = {
	fetchListMenu,
	fetchListConfig,
	fetchElementAuthList,
	fetchDbDialogShowData,
}
