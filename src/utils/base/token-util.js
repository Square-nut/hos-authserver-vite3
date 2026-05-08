import * as storageUtil from '@/utils/base/storage-util';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/store/mutation-types';
import Cookies from 'js-cookie';
/**
 * Token工具
 */
// 存在 type 不需要判断 cookies
export function getToken(type) {
	return storageUtil.getLocal(ACCESS_TOKEN);
	// 使用cookie 控制local  存在cookie获取local 不存在清空local
	// let authToken = Cookies.get('auth-token')
	// if(!type || authToken){
	//   return storageUtil.getLocal(ACCESS_TOKEN) || '';
	// }else {
	//   removeAllToken()
	// }
}

export function setToken(token) {
	return storageUtil.setLocal(ACCESS_TOKEN, token);
}

export function removeToken() {
	return storageUtil.removeLocal(ACCESS_TOKEN);
}

export function getRefreshToken() {
	return storageUtil.getLocal(REFRESH_TOKEN);
}

export function setRefreshToken(refreshtoken) {
	return storageUtil.setLocal(REFRESH_TOKEN, refreshtoken);
}

export function removeRefreshToken() {
	return storageUtil.removeLocal(REFRESH_TOKEN);
}

export function getAllToken() {
	return {
		token: getToken(),
		refreshToken: getRefreshToken(),
	};
}

export function setAllToken(token, refreshtoken) {
	setToken(token);
	setRefreshToken(refreshtoken);
}

export function removeAllToken() {
	// Cookies.remove('auth-token')
	removeToken();
	removeRefreshToken();
}
