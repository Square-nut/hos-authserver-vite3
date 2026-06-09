import aes from './aes-md5-crypt'
import rsa from './rsa-crypt'
import sm4 from './sm-crypt'

type CryptType = 'aes' | 'sm4' | 'rsa'

const resolveCryptType = (): CryptType =>
	(import.meta.env.VITE_APP_CRYPT_TYPE as CryptType | undefined) ?? 'rsa'

const crypt = (params: string, cryptType: CryptType = resolveCryptType()): string | false | null => {
	let cryptParam: string | false | null = null
	switch (cryptType) {
		case 'aes':
			cryptParam = aes.encryptAES(params)
			break
		case 'sm4':
			cryptParam = sm4.encryptSM(params)
			break
		case 'rsa':
			cryptParam = rsa.encryptRSA(params)
			break
	}
	return cryptParam
}

const decrypt = (params: string, cryptType: CryptType = resolveCryptType()): string | null => {
	let cryptParam: string | null = null
	switch (cryptType) {
		case 'aes':
			cryptParam = aes.decryptAES(params)
			break
		case 'sm4':
			cryptParam = sm4.decryptSM(params)
			break
		case 'rsa':
			cryptParam = rsa.decryptRSA(params)
			break
	}
	return cryptParam
}

const isTrim = <T>(data: T): T => {
	if (data && data instanceof Object && !Array.isArray(data)) {
		const record = data as Record<string, unknown>
		for (const key in record) {
			if (Object.hasOwnProperty.call(record, key)) {
				if (Array.isArray(record[key])) {
					record[key] = isTrim(record[key])
				} else if (record[key] && record[key] instanceof Object) {
					record[key] = isTrim(record[key])
				} else if (record[key] && Object.prototype.toString.call(record[key]) == '[object String]') {
					record[key] = (record[key] as string).trim()
				}
			}
		}
		return data
	} else if (data && Object.prototype.toString.call(data) == '[object String]') {
		return (data as string).trim() as T
	} else if (data && data instanceof Array) {
		const arr = data as unknown[]
		for (const key in arr) {
			if (Object.hasOwnProperty.call(arr, key)) {
				if ((arr[key] && arr[key] instanceof Object) || (arr[key] && arr[key] instanceof Array)) {
					arr[key] = isTrim(arr[key])
				}
			}
		}
		return data
	}
	return data
}

export interface CryptUtil {
	crypt: (value: string, cryptType?: CryptType) => string | false | null
	decrypt: (value: string, cryptType?: CryptType) => string | null
	isTrim: <T>(data: T) => T
}

const cryptUtil: CryptUtil = {
	crypt,
	decrypt,
	isTrim,
}

export default cryptUtil
