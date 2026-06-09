/**
 * 获取顶部地址栏地址
 */
export const getTopUrl = (): string => {
	return unescape(decodeURI(window.location.href.split('/#/')[0] ?? ''))
}

/**
 * 获取url参数
 * @param name 参数名
 */
export const getQueryString = (name: string): string | null => {
	const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
	const r = window.location.search.substr(1).match(reg)
	if (r != null && r[2] != null) return unescape(r[2])
	return null
}
