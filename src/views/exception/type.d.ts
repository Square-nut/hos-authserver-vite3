interface ExceptionConfig {
	img: string
	title: string
	desc: string
}

declare const types: Record<string, ExceptionConfig> & {
	'403': ExceptionConfig
	'404': ExceptionConfig
	'500': ExceptionConfig
}

export default types
