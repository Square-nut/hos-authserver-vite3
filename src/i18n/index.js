// 如果使用模块系统 (例如通过 vue-cli)，则需要导入 Vue 和 VueI18n ，然后调用 Vue.use(VueI18n)。
import Vue from 'vue';
import VueI18n, { Locale, Path, Values } from 'vue-i18n';
// import messages from './langs'
import { getLocale } from '@/utils/i18n/i18n-util';

// import enLocale from 'hosui/lib/locale/lang/en';
// import zhLocale from 'hosui/lib/locale/lang/zh-CN';

Vue.use(VueI18n);

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

// 通过选项创建 VueI18n 实例
const i18n = new VueI18n({
	locale: getLocale(), // 设置地区
	missing: (locale, key, vm, values) => {
		return missingFunc(locale, key, vm, values);
	},
	silentTranslationWarn: true,
	messages: {
		// en: {
		// 	...enLocale,
		// },
		// zh: {
		// 	...zhLocale,
		// },
	},
});

// 现在应用程序已经准备好了

export default i18n;
