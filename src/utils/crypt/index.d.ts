export interface CryptUtil {
	crypt: (value: string) => string
	decrypt: (value: string) => string
	isTrim: <T>(data: T) => T
}

declare const cryptUtil: CryptUtil
export default cryptUtil
