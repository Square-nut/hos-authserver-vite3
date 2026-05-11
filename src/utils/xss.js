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

/** @param {string} html */
export function filterXss(html) {
	return xssLib(html, options)
}

export default filterXss
