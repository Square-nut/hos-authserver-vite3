import xssLib from 'xss'

const options = {
	whiteList: {
		a: ['href', 'style'],
		img: ['src', 'alt'],
	},
	stripIgnoreTag: true,
	stripIgnoreTagBody: ['script', 'style'],
	onTagAttr() {
		// todo
	},
}

export function filterXss(html: string): string {
	return xssLib(html, options)
}

export default filterXss
