/**
 * 租户
 */
import { httpGet } from '@/axios'

export function fetchTenant(params?: Record<string, unknown>) {
	return httpGet<unknown>('/rest/login/auth/select-tenant-by-domain', params)
}

export const tenantApi = {
	fetchTenant,
}
