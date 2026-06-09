/*
    date 可以日期对象或可以转换成日期对象的格式  例如 1481370957935
    fmt  例如：yyyy-MM-dd HH:mm:ss
*/
export default function formatDate(
	date: string | number | Date | null | undefined,
	fmt?: string,
): string {
	if (!date) {
		return ''
	}
	let format = fmt ?? 'yyyy-MM-dd'
	const d = new Date(date)
	const o: Record<string, number> = {
		'M+': d.getMonth() + 1,
		'd+': d.getDate(),
		'h+': d.getHours(),
		'm+': d.getMinutes(),
		's+': d.getSeconds(),
		'q+': Math.floor((d.getMonth() + 3) / 3),
		S: d.getMilliseconds(),
	}
	const week: Record<string, string> = {
		'0': '/u65e5',
		'1': '/u4e00',
		'2': '/u4e8c',
		'3': '/u4e09',
		'4': '/u56db',
		'5': '/u4e94',
		'6': '/u516d',
	}
	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length))
	}
	if (/(E+)/.test(format)) {
		format = format.replace(
			RegExp.$1,
			(RegExp.$1.length > 1 ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') +
				week[d.getDay() + ''],
		)
	}
	for (const k in o) {
		if (new RegExp('(' + k + ')').test(format)) {
			format = format.replace(
				RegExp.$1,
				RegExp.$1.length === 1 ? String(o[k]) : ('00' + o[k]).substr(('' + o[k]).length),
			)
		}
	}
	return format
}
