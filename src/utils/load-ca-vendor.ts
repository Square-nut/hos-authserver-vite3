/**
 * CA 厂商脚本放在 **`public/ca/`**（构建后由站点根路径 `{BASE_URL}ca/` 访问），
 * 后端登录配置里的 **`jsPath`** 传入相对片段，运行时用 **`import()`** 动态加载。
 *
 * **`import()` 兼容性**（动态加载 ES module，非 IE）：
 * - Chrome 63+、Firefox 67+、Safari 11.1+、Edge（Chromium）79+ 等均支持。
 * - **不支持 IE11**。若仍须兼容 IE，需改为打包内嵌或 `<script>` 注入等非 ESM 方案。
 *
 * 路径兼容：`ca/xxx.js`（旧）、`login/ca/xxx.js`、`ca-vendor/xxx.js`（旧目录名）、仅文件名 `xxx.js`，
 * 最终均解析到 **`{BASE_URL}ca/...`**。
 */

/**
 * 将接口返回的单段路径解析为浏览器可请求的脚本 URL（绝对路径）。
 */
export function resolveCaVendorScriptUrl(configPath: string): string {
	const trimmed = configPath.trim()
	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed
	}

	let p = trimmed.replace(/^\/+/, '')

	// 旧目录名 ca-vendor，现统一为 public/ca
	if (p.startsWith('ca-vendor/')) {
		p = p.slice('ca-vendor/'.length)
	}

	const legacyPrefixes = [
		'views/login/ca/',
		'login/ca/',
		'src/views/login/ca/',
		'ca/',
	]
	for (const prefix of legacyPrefixes) {
		if (p.startsWith(prefix)) {
			p = p.slice(prefix.length)
			break
		}
	}

	const segments = ['ca', ...p.split('/').filter(Boolean)]

	const encodedPath = segments.map((s) => encodeURIComponent(s)).join('/')
	const base = import.meta.env.BASE_URL.replace(/\/?$/, '/')
	if (typeof window === 'undefined') {
		return `${base}${encodedPath}`
	}
	return new URL(encodedPath, `${window.location.origin}${base}`).href
}

/**
 * 按逗号分隔依次加载多个脚本；与原先 `require` 循环一致，**仅保留最后一个模块**的导出。
 */
export async function loadCaVendorExports(
	jsPathCommaSeparated: string,
): Promise<Record<string, unknown>> {
	const parts = jsPathCommaSeparated
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean)
	if (parts.length === 0) {
		return {}
	}
	let last: Record<string, unknown> = {}
	for (const part of parts) {
		const url = resolveCaVendorScriptUrl(part)
		const mod = (await import(/* @vite-ignore */ url)) as Record<
			string,
			unknown
		>
		last = mod
	}
	return last
}
