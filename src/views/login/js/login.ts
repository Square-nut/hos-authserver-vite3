import AuthConstant from '@/constant/auth-constant'
import i18n from '@/i18n/index'

/** Login error codes referenced by getLoginErrorDesc; not yet on AuthConstant type. */
type LoginAuthConstant = typeof AuthConstant & Record<string, string>

const loginAuthConstant = AuthConstant as LoginAuthConstant

/**
 * 根据错误码返回登录错误描述
 */
export function getLoginErrorDesc(code: string, msg?: string): string {
	let errorDesc = ''
	switch (code) {
		case loginAuthConstant.grantTypeNotFondErrorCode:
			errorDesc = i18n.global.t('不支持此授权模式！')
			break
		case loginAuthConstant.grantTypeNotNullErrorCode:
			errorDesc = i18n.global.t('grantType授权模式字段不能为空！')
			break
		case loginAuthConstant.userDisableErrorCode:
			errorDesc = i18n.global.t('您的账户已被禁用，请联系管理员！')
			break
		case loginAuthConstant.userLockErrorCode: {
			errorDesc = i18n.global.t('您的帐户已被锁定,请${0}分钟后再试！')
			errorDesc = errorDesc.replace('${0}', msg ?? '')
			break
		}
		case loginAuthConstant.userLockRemindErrorCode: {
			errorDesc = i18n.global.t('您的账户已被锁定，解锁时间：${0}')
			errorDesc = errorDesc.replace('${0}', msg ?? '')
			break
		}
		case loginAuthConstant.userOutDateErrorCode:
			errorDesc = i18n.global.t('您的账户已过期，请联系管理员！')
			break
		case loginAuthConstant.userNotCorrectErrorCode:
			errorDesc = i18n.global.t('新密码不符合密码策略')
			break
		case loginAuthConstant.tenantOutDateErrorCode:
			errorDesc = i18n.global.t('您所属的租户无效，请联系管理员！')
			break
		case loginAuthConstant.captcheInvalidErrorCode:
			errorDesc = i18n.global.t('验证码无效，请重新再试！')
			break
		case loginAuthConstant.captcheNotCorrectErrorCode:
			errorDesc = i18n.global.t('验证码不正确，请重新输入！')
			break
		case loginAuthConstant.userNotMacthErrorCode:
			errorDesc = i18n.global.t('用户不存在')
			break
		case loginAuthConstant.otpCodeInvalidErrorCode:
			errorDesc = i18n.global.t('口令有误，请重新获取后再登录！')
			break
		case loginAuthConstant.otpUserNotFondErrorCode:
			errorDesc = i18n.global.t('手机号或者邮箱未注册，请重新登录！')
			break
	}
	return errorDesc
}
