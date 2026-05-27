/**
 * 扫码登录
 */
import { httpGet, httpPost } from '@/axios'

export function fetchPhoneScan() {
	return httpGet<unknown>('/security/scan/code')
}

export function fetchPhoneScanStatus(params?: Record<string, unknown>) {
	return httpGet<unknown>('/security/scan/status', params)
}

export function fetchScanConfig() {
	return httpGet<unknown>('/hosIamLoginModel/get-scan-config')
}

export function fetchSaveScanConfig(data?: Record<string, unknown>) {
	return httpPost<unknown>('/hosIamLoginModel/save-scan-config', data)
}

/** --- loader（与旧版 scan-code.js 一致）--- */
export function getPhoneScan() {
	return { url: '/security/scan/code', method: 'get' }
}

export function getPhoneScanStatus(params?: Record<string, unknown>) {
	return { url: '/security/scan/status', method: 'get', params }
}

export function getScanConfig() {
	return { url: '/hosIamLoginModel/get-scan-config', method: 'get' }
}

export function saveScanConfig(data?: Record<string, unknown>) {
	return { url: '/hosIamLoginModel/save-scan-config', method: 'post', data }
}

export const scanCodeApi = {
	fetchPhoneScan,
	fetchPhoneScanStatus,
	fetchScanConfig,
	fetchSaveScanConfig,
}
