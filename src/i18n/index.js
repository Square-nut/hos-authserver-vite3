import { createI18n } from 'vue-i18n';
// import messages from './langs'
import { getLocale } from '@/utils/i18n/i18n-util';

// import enLocale from 'hosui/lib/locale/lang/en';
// import zhLocale from 'hosui/lib/locale/lang/zh-CN';

function missingFunc(locale, key, vm, values) {
	// var reg = /(?<=\{)(.+?)(?=\})/g;
	var reg = /(?:\{)(.+?)(?=\})/g;
	var arr = key.match(reg);
	if (!arr || values.length == 0) {
		return key;
	} else {
		var currentKey = key;
		for (var i = 0; i < arr.length; i++) {
			var content = arr[i];
			var replaceContent = '{' + arr[i] + '}';
			if (typeof values[0] == 'object') {
				currentKey = values[0][content]
					? currentKey.replace(replaceContent, values[0][content])
					: currentKey;
			} else {
				currentKey = values[content]
					? currentKey.replace(replaceContent, values[content])
					: currentKey;
			}
		}
		return currentKey;
	}
}

const i18n = createI18n({
	legacy: true,
	locale: getLocale(), // 设置地区
	missing: (locale, key, vm, values) => {
		return missingFunc(locale, key, vm, values);
	},
	missingWarn: false,
	fallbackWarn: false,
	messages: {
		// en: {
		// 	...enLocale,
		// },
		// zh: {
		// 	...zhLocale,
		// },
	},
});

// 兼容旧代码中 i18n.mergeLocaleMessage(...) 的调用方式
i18n.mergeLocaleMessage = (...args) => i18n.global.mergeLocaleMessage(...args);

export default i18n;
