/**
 * SSO 单点访问
 */
import { http, httpPost } from '@/axios'

export function fetchSsoSystemList() {
	return httpPost<unknown>('/sso/ssoVisits/systemList')
}

export function savePersonalConfig(param?: Record<string, unknown>) {
	return httpPost<unknown>('/sso/personalConfigs/save', param)
}

export function fetchSystemExeDownload(param?: Record<string, unknown>) {
	return http<unknown>({
		method: 'post',
		url: '/sso/ssoVisits/systemExeDownload',
		params: param,
	})
}

export function fetchSsoRoleList(param?: Record<string, unknown>) {
	return http<unknown>({
		method: 'post',
		url: '/sso/ssoVisits/roleList',
		params: param,
	})
}

export function saveProgramInstallRecord(param?: Record<string, unknown>) {
	return http<unknown>({
		method: 'post',
		url: '/sso/programRecords/save',
		params: param,
	})
}

export const ssoVisitApi = {
	fetchSsoSystemList,
	savePersonalConfig,
	fetchSystemExeDownload,
	fetchSsoRoleList,
	saveProgramInstallRecord,
}
