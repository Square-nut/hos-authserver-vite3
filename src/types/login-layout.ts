/** Login layout / getLoginConfig related types */

export interface FileRef {
	login_back_file_id?: string
}

export interface CopyrightItem {
	type?: 'String' | 'Trademark' | string
	actived?: boolean
	content?: string | FileRef
	newline?: boolean
}

export interface BackgroundSlide {
	type?: string
	sort?: number
	actived?: boolean
	content?: FileRef
	/** 扁平结构兼容 */
	login_back_file_id?: string
}

/** 轮播展示用（模板） */
export interface CarouselSlide {
	type?: string
	sort: number
	actived?: boolean
	content?: FileRef
	login_back_file_id?: string
}

export interface LoginPageDataDTO {
	layout?: 'left' | 'center' | 'right' | string
	companyName?: string
	companyLogo?: FileRef
	copyrightInformationSwitch?: number
	copyrightInformationInfo?: CopyrightItem[]
	backGround?: BackgroundSlide[]
	backGroundFullScreen?: boolean
	backGroundSize?: string | number
	browserTabName?: string
	browserTabLogo?: FileRef
	showPersonalization?: number
	personalization?: unknown[]
	easyUserInfo?: boolean
	showI18n?: number
	showLicense?: number
	welcomeMessage?: unknown[]
	/** 兼容 index.vue 旧字段名 */
	hosBackground?: string
	hosBackgroundFullScreen?: boolean
	hosBackgroundSize?: string | number
	easyTitle?: string
	easyCopyrightInformation?: string
	hosCopyrightInformation?: string
	easyBrowserTabName?: string
	hosBrowserTabName?: string
	easyBrowserTabLogo?: string | FileRef
	hosBrowserTabLogo?: string | FileRef
	easyBackGround?: CarouselSlide[]
	[key: string]: unknown
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
