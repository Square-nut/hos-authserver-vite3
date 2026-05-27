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

/** 获取客户端 IP/MAC 等配置（响应格式为 websys 自有结构，非标准 ApiResult） */
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

/** loader：`websys.cmd`（与旧版 websys.js 一致） */
export function cmd() {
	return {
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
}

export const websysApi = {
	fetchWebsysCmd,
}
