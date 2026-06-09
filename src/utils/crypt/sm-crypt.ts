import { sm4 } from 'sm-crypto'

const key = '1234567890123456'

function utf8ToArray(str: string): number[] {
	const arr: number[] = []

	for (let i = 0, len = str.length; i < len; i++) {
		const point = str.codePointAt(i)!

		if (point <= 0x007f) {
			arr.push(point)
		} else if (point <= 0x07ff) {
			arr.push(0xc0 | (point >>> 6))
			arr.push(0x80 | (point & 0x3f))
		} else if (point <= 0xd7ff || (point >= 0xe000 && point <= 0xffff)) {
			arr.push(0xe0 | (point >>> 12))
			arr.push(0x80 | ((point >>> 6) & 0x3f))
			arr.push(0x80 | (point & 0x3f))
		} else if (point >= 0x010000 && point <= 0x10ffff) {
			i++
			arr.push((0xf0 | ((point >>> 18) & 0x1c)) as number)
			arr.push((0x80 | ((point >>> 12) & 0x3f)) as number)
			arr.push((0x80 | ((point >>> 6) & 0x3f)) as number)
			arr.push((0x80 | (point & 0x3f)) as number)
		} else {
			arr.push(point)
			throw new Error('input is not supported')
		}
	}

	return arr
}

const encryptSM = (msg: string): string => {
	return encodeURIComponent(sm4.encrypt(msg, utf8ToArray(key)))
}

const decryptSM = (encryptData: string): string => {
	return sm4.decrypt(encryptData, utf8ToArray(key))
}

export default {
	encryptSM,
	decryptSM,
}
