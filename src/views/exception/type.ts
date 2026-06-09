export interface ExceptionConfig {
	img: string
	title: string
	desc: string
}

export type ExceptionType = '403' | '404' | '500'

const types: Record<ExceptionType, ExceptionConfig> = {
	'403': {
		img: 'https://gw.alipayobjects.com/zos/rmsportal/wZcnGqRDyhPOEYFcZDnb.svg',
		title: '403',
		desc: '抱歉，你无权访问该页面',
	},
	'404': {
		img: 'https://gw.alipayobjects.com/zos/rmsportal/KpnpchXsobRgLElEozzI.svg',
		title: '404',
		desc: '抱歉，你访问的页面不存在或无权访问',
	},
	'500': {
		img: 'https://gw.alipayobjects.com/zos/rmsportal/RVRUAYdCGeYNBWoKiIwB.svg',
		title: '500',
		desc: '抱歉，服务器出错了',
	},
}

export default types
