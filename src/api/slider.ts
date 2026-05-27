/**
 * 拼图滑块验证码（openApi/security/jigsaw）
 */
import { httpGet, httpPost } from '@/axios'

type Params = Record<string, unknown> | undefined

/** loader / `$api('slider.generateCaptcha')` */
export function generateCaptcha(params?: Params) {
	return {
		url: 'openApi/security/jigsaw/generateCaptcha',
		method: 'get',
		params,
	}
}

/** loader / `$api('slider.verifyCaptcha')` */
export function verifyCaptcha(data?: Params) {
	return {
		url: 'openApi/security/jigsaw/verifyCaptcha',
		method: 'post',
		data,
	}
}

/** loader / `$api('slider.verifyToken')` */
export function verifyToken(data?: Params) {
	return {
		url: 'openApi/security/jigsaw/verifyToken',
		method: 'post',
		data,
	}
}

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
