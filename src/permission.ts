import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import router from '@/router'
import { useLoginSessionStore } from '@/stores/loginSession'
import { INDEX_MAIN_PAGE_PATH } from '@/store/mutation-types'
import { fetchI18nLoginPageConfig } from '@/api/i18n'

import { getToken } from '@/utils/base/token-util'
import { useUserStore } from '@/stores/user'
import { isForceMac } from '@/utils/mac-util'

import i18n from '@/i18n'
import {
	getLocale,
	setCurrentLocale,
	setDefaultLocale,
	getCurrentLocale,
	getDefaultLocale,
} from '@/utils/i18n/i18n-util'

interface RouteMetaWithAdvancedJs {
	advancedJs?: string
}

const whiteList = [
	'/login',
	'/setpassword',
	'/oauth/logout',
	'/oauth/sign-out',
	'/oauth/other-browser-redirect/' + (import.meta.env.VITE_APP_LOGIN_SOURCE ?? ''),
]

function resolveQueryLanguage(language: unknown): string | undefined {
	if (typeof language === 'string') return language
	if (Array.isArray(language) && typeof language[0] === 'string') return language[0]
	return undefined
}

router.beforeEach(async (to, _from, next: NavigationGuardNext) => {
	await isForceMac()

	const queryLanguage = resolveQueryLanguage(to.query.language)
	if (queryLanguage) {
		setCurrentLocale(queryLanguage)
	}

	await loginPageElements()

	if (to.fullPath === '/oauth/postMessage') {
		next()
		return
	}
	if (getToken(true)) {
		if (to.path.includes('/login') || to.path === '/') {
			next({ path: INDEX_MAIN_PAGE_PATH })
		} else if (to.path.includes('/oauth/authorize')) {
			next()
		} else {
			executeAdvancedJs(to)
			next()
		}
	} else if (whiteList.indexOf(to.path) !== -1) {
		executeAdvancedJs(to)
		next()
	} else if (to.query.freeToken) {
		const freeToken = resolveQueryLanguage(to.query.freeToken)
		if (freeToken) {
			noLoginFunction(freeToken, next, to)
		} else {
			next({ path: '/login', query: { redirect: to.fullPath } })
		}
	} else {
		next({ path: '/login', query: { redirect: to.fullPath } })
	}
})

function executeAdvancedJs(route: RouteLocationNormalized): void {
	const advancedJs = (route.meta as RouteMetaWithAdvancedJs).advancedJs
	if (advancedJs) {
		// eslint-disable-next-line no-eval
		eval(advancedJs)
	}
}

function noLoginFunction(
	freeToken: string,
	next: NavigationGuardNext,
	to: RouteLocationNormalized,
): void {
	const freeLoginParam = {
		grantType: 'free-password',
		freeToken,
	}
	const currentQuery = { ...to.query }
	delete currentQuery.freeToken
	delete currentQuery.freeLoginType
	useUserStore()
		.Login(freeLoginParam)
		.then(() => {
			next({ path: to.path, query: currentQuery })
		})
		.catch(() => {
			next({ path: '/login', query: { redirect: to.fullPath } })
		})
}

async function loginPageElements(): Promise<void> {
	const loginSessionStore = useLoginSessionStore()
	try {
		const language = getCurrentLocale() || getDefaultLocale() || ''
		const { data, code } = await fetchI18nLoginPageConfig({ language })
		if (code == 200) {
			loginSessionStore.SET_I18N_STATUS(!!data?.languageList?.length)
			loginSessionStore.SET_I18N_LIST(data?.languageList || [])
			const defaultLang = data?.languageList?.find((item) => item.isDefault)
			setDefaultLocale(defaultLang?.value || 'zh')
			i18n.global.mergeLocaleMessage(getLocale(), data?.pageElements ?? {})
			setCurrentLocale(getLocale())
		}
	} catch {
		loginSessionStore.SET_I18N_STATUS(false)
	}
}
