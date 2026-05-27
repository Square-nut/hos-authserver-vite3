/**
 * 员工（独立 baseURL，示例/遗留接口）
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

/** --- loader（与旧版 staff.js 一致，返回 request config）--- */
export const $config = { baseURL: STAFF_BASE_URL }

export function selectPageStaff(param?: Record<string, unknown>) {
	return { url: '/staff/selectPageStaff', method: 'get', params: param }
}

export function selectPage(param?: Record<string, unknown>) {
	return { url: '/staff/selectPage', method: 'get', params: param }
}

export function insert(param?: Record<string, unknown>) {
	return { url: '/staff/insert', method: 'post', data: param }
}

export function selectById(id: string | number) {
	return { url: '/staff/selectById', method: 'get', params: { id } }
}

export function updateById(param?: Record<string, unknown>) {
	return { url: '/staff/updateById', method: 'post', data: param }
}

export function deleteById(id: string | number) {
	return {
		url: '/staff/deleteStaffById',
		method: 'post',
		needSign: true,
		needCrypt: true,
		needDecrypt: true,
		params: { id },
	}
}

export function api4(param?: Record<string, unknown>) {
	const { name, phone, email } = (param || {}) as Record<string, string>
	return {
		url: `/staff/selectPageStaff/${name}`,
		method: 'post',
		params: { phone },
		data: { email, current: 1, size: 10 },
	}
}

export const staffApi = {
	fetchSelectPageStaff,
	fetchStaffSelectPage,
	insertStaff,
	fetchStaffById,
	updateStaffById,
	deleteStaffById,
}
