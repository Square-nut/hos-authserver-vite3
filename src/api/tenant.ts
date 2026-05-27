/**
 * 租户
 */
import { httpGet } from '@/axios'

export function fetchTenant(params?: Record<string, unknown>) {
	return httpGet<unknown>('/rest/login/auth/select-tenant-by-domain', params)
}

/** loader：`tenant.getTenant` */
export function getTenant(params?: Record<string, unknown>) {
	return {
		url: '/rest/login/auth/select-tenant-by-domain',
		method: 'get',
		params,
	}
}

export const tenantApi = {
	fetchTenant,
}
