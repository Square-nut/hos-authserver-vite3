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

export const scanCodeApi = {
	fetchPhoneScan,
	fetchPhoneScanStatus,
	fetchScanConfig,
	fetchSaveScanConfig,
}
