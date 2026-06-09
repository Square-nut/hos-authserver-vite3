/**
 * 以下是登录相关的常量
 */
const Constant = {
	httpCode: {
		OK: 200,
		BAD_REQUEST: 400,
		UNAUTHORIZED: 401,
		NOT_PERMISSION: 403,
		NOT_FOUND: 404,
		INTERNAL_SERVER_ERROR: 500,
	},
} as const

export type HttpCodeKey = keyof typeof Constant.httpCode
export type CommonConstant = typeof Constant

export default Constant
