declare module 'js-cookie' {
	interface CookiesStatic {
		get(name?: string): string | undefined
		set(name: string, value: string, options?: Record<string, unknown>): string | undefined
		remove(name: string, options?: Record<string, unknown>): void
	}
	const Cookies: CookiesStatic
	export default Cookies
}

declare module 'clipboard' {
	export default class Clipboard {
		constructor(trigger: Element, options?: { text?: () => string })
		on(type: 'success' | 'error', handler: () => void): void
		destroy(): void
		onClick(event: MouseEvent): void
	}
}

declare module 'crypto-js' {
	const CryptoJS: {
		MD5: (value: string) => { toString: () => string }
		enc: {
			Utf8: { parse: (value: string) => unknown; stringify: (value: unknown) => string }
			Base64: { stringify: (value: unknown) => string }
		}
		AES: {
			encrypt: (data: unknown, key: unknown, cfg: Record<string, unknown>) => { ciphertext: unknown }
			decrypt: (data: string, key: unknown, cfg: Record<string, unknown>) => unknown
		}
		mode: { CBC: unknown }
		pad: { Pkcs7: unknown }
	}
	export default CryptoJS
}

declare module 'encryptlong' {
	export class JSEncrypt {
		setPublicKey(key: string): void
		setPrivateKey(key: string): void
		encryptLong(value: string): string | false
		decryptLong(value: string): string
	}
}

declare module 'sm-crypto' {
	export const sm4: {
		encrypt: (msg: string, key: number[]) => string
		decrypt: (encryptData: string, key: number[]) => string
	}
}

declare module 'xss' {
	export default function xss(html: string, options?: Record<string, unknown>): string
}
