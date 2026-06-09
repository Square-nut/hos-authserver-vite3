import CryptoJS from 'crypto-js'

const md5Key = '1234567890123456'
const AESKey = '1234567890123456qwertyuiopasdfgh'

interface Md5Config {
	data?: Record<string, unknown>
	params?: Record<string, unknown>
	pathVariable?: Record<string, unknown>
	headers: Record<string, string | number>
}

const encryptMD5 = (config: Md5Config): Md5Config => {
	const { data, params, pathVariable } = config
	const str = 'secret=' + md5Key + '#' + signatureSort(data, params, pathVariable)
	config.headers['signature'] = CryptoJS.MD5(str).toString()
	config.headers['timestamp'] = new Date().getTime()
	return config
}

const encryptAES = (data: string): string => {
	const dataBytes = CryptoJS.enc.Utf8.parse(data)
	const keyBytes = CryptoJS.enc.Utf8.parse(AESKey)
	const encrypted = CryptoJS.AES.encrypt(dataBytes, keyBytes, {
		iv: keyBytes,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	})
	return encodeURIComponent(CryptoJS.enc.Base64.stringify(encrypted.ciphertext))
}

const decryptAES = (data: string): string => {
	const keyBytes = CryptoJS.enc.Utf8.parse(AESKey)
	const decrypted = CryptoJS.AES.decrypt(data, keyBytes, {
		iv: keyBytes,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	})
	return CryptoJS.enc.Utf8.stringify(decrypted)
}

const sortObj = (obj: Record<string, unknown>): string => {
	const newkey = Object.keys(obj).sort()
	const newObj: Record<string, unknown> = {}
	newkey.forEach((item) => {
		if (obj[item]) {
			newObj[item] = obj[item]
		}
	})
	const str: string[] = []
	for (const k in newObj) {
		if (newObj[k]) {
			str.push(k + '=' + newObj[k])
		}
	}
	return str.length > 0 ? str.join('#') : str.join('')
}

const signatureSort = (
	data?: Record<string, unknown>,
	params?: Record<string, unknown>,
	pathVariable?: Record<string, unknown>,
): string => {
	const newArr: string[] = []
	if (data) {
		const newDataStr = JSON.stringify(data)
		if (newDataStr) {
			newArr.push(newDataStr)
		}
	}
	if (params) {
		const newParamsStr = sortObj(params)
		if (newParamsStr) {
			newArr.push(newParamsStr)
		}
	}
	if (pathVariable) {
		const newPathStr = sortObj(pathVariable)
		if (newPathStr) {
			newArr.push(newPathStr)
		}
	}
	return newArr.join('#')
}

export default {
	encryptMD5,
	encryptAES,
	decryptAES,
	sortObj,
}
