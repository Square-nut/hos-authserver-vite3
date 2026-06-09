/**
 * 拼图滑块验证码（openApi/security/jigsaw）
 */
import { httpGet, httpPost } from '@/axios'

type Params = Record<string, unknown> | undefined

export function fetchGenerateCaptcha(params?: Params) {
	return httpGet<unknown>('openApi/security/jigsaw/generateCaptcha', params)
}

export function fetchVerifyCaptcha(data?: Params) {
	return httpPost<unknown>('openApi/security/jigsaw/verifyCaptcha', data)
}

export function fetchVerifyToken(data?: Params) {
	return httpPost<unknown>('openApi/security/jigsaw/verifyToken', data)
}

export const sliderApi = {
	fetchGenerateCaptcha,
	fetchVerifyCaptcha,
	fetchVerifyToken,
}
