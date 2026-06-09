/**
 * 本地 websys 客户端探测（独立 baseURL）
 */
import { http } from '@/axios'
import type { HttpOptions } from '@/axios/http'

export function getWebsysBaseUrl(): string {
	const protocol = window.location.protocol
	const port = protocol === 'http:' ? '11996' : '21996'
	return `${protocol}//localhost:${port}/websys/`
}

const WEBSYS_VERSION = '1.0.0.0'

/** 获取客户端 IP/MAC 等配置（websys 自有响应结构） */
export function fetchWebsysCmd() {
	const config: HttpOptions = {
		method: 'post',
		url: '/cmd/cmd',
		baseURL: getWebsysBaseUrl(),
		emulateJSON: true,
		data: {
			_version: WEBSYS_VERSION,
			_clientIPExp: '',
			M_GetConfig: '',
		},
	}
	return http<unknown>(config)
}

export const websysApi = {
	fetchWebsysCmd,
}
