import * as storageUtil from '@/utils/base/storage-util'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/store/mutation-types'

/** Token工具 */
export function getToken(_type?: unknown): unknown {
	return storageUtil.getLocal(ACCESS_TOKEN)
}

export function setToken(token: unknown): unknown {
	return storageUtil.setLocal(ACCESS_TOKEN, token)
}

export function removeToken(): unknown {
	return storageUtil.removeLocal(ACCESS_TOKEN)
}

export function getRefreshToken(): unknown {
	return storageUtil.getLocal(REFRESH_TOKEN)
}

export function setRefreshToken(refreshtoken: unknown): unknown {
	return storageUtil.setLocal(REFRESH_TOKEN, refreshtoken)
}

export function removeRefreshToken(): unknown {
	return storageUtil.removeLocal(REFRESH_TOKEN)
}

export function getAllToken(): { token: unknown; refreshToken: unknown } {
	return {
		token: getToken(),
		refreshToken: getRefreshToken(),
	}
}

export function setAllToken(token: unknown, refreshtoken: unknown): void {
	setToken(token)
	setRefreshToken(refreshtoken)
}

export function removeAllToken(): void {
	removeToken()
	removeRefreshToken()
}
