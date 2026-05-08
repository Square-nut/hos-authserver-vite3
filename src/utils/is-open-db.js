import Vue from 'vue';
import { Message } from 'element-plus';
import i18n from '@/i18n';
import UserConstant from '@/constant/user-constant';

/**
 * 登录之前判断是否开启弹窗.如果开启,但获取不到IP/MAC,则提示错误信息
 * @param {string} loginName 登录名,如果是admin则跳过前端校验
 * @returns {boolean} 拦截则返回false,否则返回true
 */

export const isOpenDb = (loginName) => {
	if (Vue.ls.get('isOpenDb')) {
		const IP = Vue.ls.get(UserConstant.IP);
		const MAC = Vue.ls.get(UserConstant.Mac);
		if ((!IP || !MAC) && loginName !== 'admin') {
			Message.warning(i18n.t('请安装并运行医为客户端管理程序！'));
			return false;
		}
	}
	return true;
};
