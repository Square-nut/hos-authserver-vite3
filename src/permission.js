import router from '@/router';
// import store from '@/store';
import { useDeviceStore } from '@/stores/device';
import api from '@/axios';
import { INDEX_MAIN_PAGE_PATH } from '@/store/mutation-types';

import { getToken } from '@/utils/base/token-util';
import { useUserStore } from '@/stores/user';
import { isForceMac } from '@/utils/mac-util';

import i18n from '@/i18n';
import {
	getLocale,
	setCurrentLocale,
	setDefaultLocale,
	getCurrentLocale,
	getDefaultLocale,
} from '@/utils/i18n/i18n-util';

const whiteList = [
	'/login',
	'/setpassword',
	'/oauth/logout',
	'/oauth/sign-out',
	'/oauth/other-browser-redirect/' +
		(import.meta.env.VITE_APP_LOGIN_SOURCE ||
			import.meta.env.VUE_APP_LOGIN_SOURCE ||
			''),
]; // no redirect whitelist

router.beforeEach(async (to, from, next) => {
	// 如果开启了强制使用MAC地址,则必须await到MAC地址才放行
	await isForceMac();

	// 设置多语言 bug4441729
	if (to.query.language) {
		setCurrentLocale(to.query.language);
	}

	await loginPageElements();

	// 跳转 postMessage 不需要验证token
	if (to.fullPath === '/oauth/postMessage') {
		next();
		return;
	}
	if (getToken(true)) {
		/* has token */
		if (to.path.includes('/login') || to.path === '/') {
			next({ path: INDEX_MAIN_PAGE_PATH });
		} else if (to.path.includes('/oauth/authorize')) {
			next();
		} else {
			// 执行高级js
			executeAdvancedJs(to);
			next();
		}
	} else {
		if (whiteList.indexOf(to.path) !== -1) {
			// 在免登录白名单内,直接进入
			// 执行高级js
			executeAdvancedJs(to);
			next();
		} else {
			if (to.query.freeToken) {
				noLoginFunction(to.query.freeToken, next, to);
			} else {
				// 跳转到登录页面
				let path = '/login';
				next({ path: path, query: { redirect: to.fullPath } });
			}
		}
	}
});

function executeAdvancedJs(route) {
	if (route.meta.advancedJs) {
		eval(route.meta.advancedJs);
		// console.log('执行高级js,结果为:',eval(route.meta.advancedJs));
	}
}

// 免登陆
function noLoginFunction(freeToken, next, to) {
	let freeLoginParam = {
		grantType: 'free-password',
		freeToken: freeToken,
	};
	let currentQuery = to.query;
	delete currentQuery.freeToken;
	delete currentQuery.freeLoginType;
	useUserStore()
		.dispatch('Login', freeLoginParam)
		.then((res) => {
			next({ path: to.path, query: currentQuery });
		})
		.catch(() => {
			let redirect = to.path;
			Object.keys(currentQuery).forEach((key, index) => {
				if (index == 0) {
					redirect = redirect + '?' + key + '=' + currentQuery[key];
				} else {
					redirect = redirect + '&' + key + '=' + currentQuery[key];
				}
			});
			// 跳转到登录页面
			let path = '/login';
			next({ path: path, query: { redirect: to.fullPath } });
		});
}

// 获取登录页的国际化信息
async function loginPageElements() {
	try {
		const language = getCurrentLocale() || getDefaultLocale() || '';
		const { data, code } = await api.request('getI18nConfig', {}, { language });
		if (code == 200) {
			store.commit('SET_I18N_STATUS', !!data?.languageList?.length);
			store.commit('SET_I18N_LIST', data?.languageList || []);
			const defaultLang = data?.languageList?.find((item) => item.isDefault);
			setDefaultLocale(defaultLang.value || 'zh');
			i18n.mergeLocaleMessage(getLocale(), data.pageElements);
			setCurrentLocale(getLocale());
		}
	} catch (error) {
		store.commit('SET_I18N_STATUS', false);
	}
}
