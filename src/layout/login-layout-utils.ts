import loginBg01 from '@/assets/images/login/01.png'
import loginBg02 from '@/assets/images/login/02.png'
import loginBg03 from '@/assets/images/login/03.png'
import type { BackgroundSlide, CarouselSlide, LoginPageDataDTO } from '@/types/login-layout'

export const defaultCarouselSlides: CarouselSlide[] = [
	{
		type: 'Image',
		sort: 1,
		actived: true,
		content: { login_back_file_id: loginBg01 },
	},
	{
		type: 'Image',
		sort: 2,
		actived: true,
		content: { login_back_file_id: loginBg02 },
	},
	{
		type: 'Image',
		sort: 3,
		actived: true,
		content: { login_back_file_id: loginBg03 },
	},
]

import { returnGlobalValue } from '@/utils'

export function resolveUiTheme(): number {
	const raw =
		returnGlobalValue('VUE_APP_SIMPLE_ONCE') ??
		import.meta.env.VITE_APP_THEME_STYLE ??
		'1'
	const n = Number(raw)
	return Number.isNaN(n) ? 1 : n
}

export function getSlideImageUrl(item: CarouselSlide | BackgroundSlide): string {
	if (item.content?.login_back_file_id) return item.content.login_back_file_id
	return item.login_back_file_id || ''
}

export function normalizeCarousel(
	backGround?: BackgroundSlide[],
): CarouselSlide[] {
	if (backGround?.length) {
		const active = backGround.filter((pic) => pic.actived !== false)
		if (active.length) return active as CarouselSlide[]
	}
	return [...defaultCarouselSlides]
}

/** 为 index.vue 等保留 hos* 字段别名 */
export function enrichLoginPageDto(dto: LoginPageDataDTO): LoginPageDataDTO {
	const enriched: LoginPageDataDTO = { ...dto }
	const bg = dto.backGround
	if (bg?.length) {
		const url = getSlideImageUrl(bg[0] as CarouselSlide)
		if (url) enriched.hosBackground = url
	}
	if (dto.backGroundFullScreen != null) {
		enriched.hosBackgroundFullScreen = dto.backGroundFullScreen
	}
	if (dto.backGroundSize != null) {
		enriched.hosBackgroundSize = dto.backGroundSize
	}
	const tabLogo = dto.browserTabLogo
	if (tabLogo && typeof tabLogo === 'object' && tabLogo.login_back_file_id) {
		enriched.hosBrowserTabLogo = tabLogo.login_back_file_id
		enriched.easyBrowserTabLogo = tabLogo.login_back_file_id
	}
	if (dto.browserTabName) {
		enriched.hosBrowserTabName = dto.browserTabName
		enriched.easyBrowserTabName = dto.browserTabName
	}
	return enriched
}

export function getFaviconHref(
	logo?: string | { login_back_file_id?: string },
): string {
	if (!logo) return ''
	if (typeof logo === 'string') return logo
	return logo.login_back_file_id || ''
}
