/**
 * 全局 localStorage 封装（替代 vue-ls），供非组件模块与 composable 直接 import。
 *
 * `get`：能 JSON 则解析为对象/数组等，否则返回原始字符串（与旧 storage-util 一致）。
 * `set`：第三个参数为 TTL（毫秒），写入 `{ value, expires }`。
 */

function parseStored(raw: string | null): unknown {
	if (raw == null || raw === '') return null
	try {
		const data: unknown = JSON.parse(raw)
		if (
			data &&
			typeof data === 'object' &&
			!Array.isArray(data) &&
			'expires' in (data as object) &&
			'value' in (data as object)
		) {
			const rec = data as { expires: number; value: unknown }
			if (typeof rec.expires === 'number' && Date.now() > rec.expires) {
				return null
			}
			return rec.value
		}
		return data
	} catch {
		return raw
	}
}

export function lsGet(key: string): unknown {
	try {
		return parseStored(localStorage.getItem(key))
	} catch {
		return null
	}
}

export function lsSet(key: string, value: unknown, expire?: number | null): void {
	try {
		if (expire == null) {
			const s =
				typeof value === 'string' ? value : JSON.stringify(value)
			localStorage.setItem(key, s)
		} else {
			const record = {
				value,
				expires: Date.now() + Number(expire),
			}
			localStorage.setItem(key, JSON.stringify(record))
		}
	} catch {
		/* quota / private mode */
	}
}

export function lsRemove(key: string): void {
	try {
		localStorage.removeItem(key)
	} catch {
		/* noop */
	}
}

export function lsClear(): void {
	try {
		localStorage.clear()
	} catch {
		/* noop */
	}
}

/** 与 Vue 组件里 `$ls` 相同 API，便于一处维护 */
export const ls = {
	get: lsGet,
	set: lsSet,
	remove: lsRemove,
	clear: lsClear,
}
