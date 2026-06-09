import cryptUtil from '@/utils/crypt/index'

export const { crypt, decrypt, isTrim } = cryptUtil

export function useCrypt() {
	return cryptUtil
}
