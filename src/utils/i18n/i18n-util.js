import { getActivePinia } from 'pinia';
import { useI18nStore } from '@/stores/i18n';

function getI18nStore() {
	try {
		if (!getActivePinia()) return null;
		return useI18nStore();
	} catch (error) {
		return null;
	}
}

/**
 * 获取当前设置的语言环境
 */
export function getCurrentLocale() {
	const store = getI18nStore();
	return store?.language || null;
}

/**
 * 设置当前语言环境
 * @param locale
 */
export function setCurrentLocale(locale) {
	const store = getI18nStore();
	if (store) store.setLanguage(locale);
}

/**
 * 获取用户的默认语言环境
 */
export function getDefaultLocale() {
	const store = getI18nStore();
	return store?.defaultLanguage || null;
}

/**
 * 设置默认语言环境
 * @param locale
 */
export function setDefaultLocale(locale) {
	const store = getI18nStore();
	if (store) store.setDefaultLanguage(locale);
}

/**
 * 优先获取当前语言,没有则获取默认语言,两者都没有返回默认值'zh'
 */
export function getLocale() {
	return getCurrentLocale() || getDefaultLocale() || 'zh';
}