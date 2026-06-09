/**
 * 员工（独立 baseURL，示例接口）
 */
import { http } from '@/axios'

export const STAFF_BASE_URL = 'http://114.242.246.250:8104/'

type StaffHttpConfig = Parameters<typeof http>[0]

function staffRequest(config: StaffHttpConfig) {
	return http({ baseURL: STAFF_BASE_URL, ...config })
}

export function fetchSelectPageStaff(param?: Record<string, unknown>) {
	return staffRequest({
		method: 'get',
		url: '/staff/selectPageStaff',
		params: param,
	})
}

export function fetchStaffSelectPage(param?: Record<string, unknown>) {
	return staffRequest({ method: 'get', url: '/staff/selectPage', params: param })
}

export function insertStaff(param?: Record<string, unknown>) {
	return staffRequest({ method: 'post', url: '/staff/insert', data: param })
}

export function fetchStaffById(id: string | number) {
	return staffRequest({
		method: 'get',
		url: '/staff/selectById',
		params: { id },
	})
}

export function updateStaffById(param?: Record<string, unknown>) {
	return staffRequest({ method: 'post', url: '/staff/updateById', data: param })
}

export function deleteStaffById(id: string | number) {
	return staffRequest({
		method: 'post',
		url: '/staff/deleteStaffById',
		needSign: true,
		needCrypt: true,
		needDecrypt: true,
		params: { id },
	} as StaffHttpConfig)
}

export const staffApi = {
	fetchSelectPageStaff,
	fetchStaffSelectPage,
	insertStaff,
	fetchStaffById,
	updateStaffById,
	deleteStaffById,
}
