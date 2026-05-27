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

/** --- loader（与旧版 ssoVisit.js 一致）--- */
export const $config = { emulateJSON: false }

export function getSystemList() {
	return { url: '/sso/ssoVisits/systemList', method: 'post' }
}

export function save(param?: Record<string, unknown>) {
	return { url: '/sso/personalConfigs/save', method: 'post', data: param }
}

export function systemExeDownload(param?: Record<string, unknown>) {
	return {
		url: '/sso/ssoVisits/systemExeDownload',
		method: 'post',
		params: param,
	}
}

export function roleList(param?: Record<string, unknown>) {
	return { url: '/sso/ssoVisits/roleList', method: 'post', params: param }
}

export function saveInstall(param?: Record<string, unknown>) {
	return { url: '/sso/programRecords/save', method: 'post', params: param }
}

export function getRoleList(param?: Record<string, unknown>) {
	return { url: '/sso/ssoVisits/roleList', method: 'post', params: param }
}

export const ssoVisitApi = {
	fetchSsoSystemList,
	savePersonalConfig,
	fetchSystemExeDownload,
	fetchSsoRoleList,
	saveProgramInstallRecord,
}
