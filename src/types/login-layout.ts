/** Login layout / getLoginConfig related types */

export interface CarouselSlide {
	sort: number
	login_back_file_id: string
}

export interface LoginPageDataDTO {
	easyTitle?: string
	easyCopyrightInformation?: string
	hosCopyrightInformation?: string
	easyBrowserTabName?: string
	hosBrowserTabName?: string
	easyBrowserTabLogo?: string
	hosBrowserTabLogo?: string
	easyBackGround?: CarouselSlide[]
}

export interface LangOption {
	label: string
	value: string
	isDefault?: boolean
}

export interface LoginTypeDataDTO {
	isFake?: boolean
	password?: Record<string, unknown>
	sms?: Record<string, unknown>
	scanCode?: Record<string, unknown>
	defaultModel?: string
	third?: Record<string, unknown>
	ca?: Record<string, unknown>
	authentication?: unknown
	enableAD?: boolean
}

export interface LoginConfigData {
	functionalVersion?: string
	portalUrl?: string
	loginPageDataDTO?: LoginPageDataDTO
	systemConfigTitle?: string | null
	loginTypeDataDTO?: LoginTypeDataDTO
}

export type { ApiResult } from '@/types/api-common'
