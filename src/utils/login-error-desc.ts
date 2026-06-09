import AuthConstant from '@/constant/auth-constant'
import i18n from '@/i18n/index'

const AC = AuthConstant as unknown as Record<string, string>

export const getLoginErrorDesc = (code: string, msg?: string): string => {
	let errorDesc = ''
	switch (code) {
		case AC.grantTypeNotFondErrorCode:
			errorDesc = String(i18n.global.t('不支持此授权模式！'))
			break
		case AC.grantTypeNotNullErrorCode:
			errorDesc = String(i18n.global.t('grantType授权模式字段不能为空！'))
			break
		case AC.userDisableErrorCode:
			errorDesc = String(i18n.global.t('您的账户已被禁用，请联系管理员！'))
			break
		case AC.userLockErrorCode:
			errorDesc = String(i18n.global.t('您的帐户已被锁定,请${0}分钟后再试！')).replace('${0}', msg ?? '')
			break
		case AC.userLockRemindErrorCode:
			errorDesc = String(i18n.global.t('您的账户已被锁定，解锁时间：${0}')).replace('${0}', msg ?? '')
			break
		case AC.userOutDateErrorCode:
			errorDesc = String(i18n.global.t('您的账户已过期，请联系管理员！'))
			break
		case AC.userNotCorrectErrorCode:
			errorDesc = String(i18n.global.t('新密码不符合密码策略'))
			break
		case AC.tenantOutDateErrorCode:
			errorDesc = String(i18n.global.t('您所属的租户无效，请联系管理员！'))
			break
		case AC.captcheInvalidErrorCode:
			errorDesc = String(i18n.global.t('验证码无效，请重新再试！'))
			break
		case AC.captcheNotCorrectErrorCode:
			errorDesc = String(i18n.global.t('验证码不正确，请重新输入！'))
			break
		case AC.userNotMacthErrorCode:
			errorDesc = String(i18n.global.t('用户不存在'))
			break
		case AC.otpCodeInvalidErrorCode:
			errorDesc = String(i18n.global.t('口令有误，请重新获取后再登录！'))
			break
		case AC.otpUserNotFondErrorCode:
			errorDesc = String(i18n.global.t('手机号或者邮箱未注册，请重新登录！'))
			break
	}
	return errorDesc
}
