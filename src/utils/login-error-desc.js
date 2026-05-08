import AuthConstant from "@/constant/auth-constant";
import i18n from "@/i18n/index";
/**
 * 获取url参数
 * @param name 参数名
 */
export const getLoginErrorDesc = (code,msg) => {
    
    let errorDesc="";
    switch(code){
        ///授权模式 不支持
        case AuthConstant.grantTypeNotFondErrorCode:{
            errorDesc=i18n.t("不支持此授权模式！");
            break;
        }
        ///授权模式 为空
        case AuthConstant.grantTypeNotNullErrorCode:{
            errorDesc=i18n.t("grantType授权模式字段不能为空！");
            break;
        }

        ///用户被禁用
        case AuthConstant.userDisableErrorCode:{
            errorDesc=i18n.t("您的账户已被禁用，请联系管理员！");
            break;
        }
        ///用户被锁定
        case AuthConstant.userLockErrorCode:{
            errorDesc=i18n.t("您的帐户已被锁定,请${0}分钟后再试！");
            errorDesc=errorDesc.replace("${0}",msg);
            break;
        }
       ///用户被锁定
        case AuthConstant.userLockRemindErrorCode:{
            errorDesc=i18n.t("您的账户已被锁定，解锁时间：${0}");
            errorDesc=errorDesc.replace("${0}",msg);
            break;
        }
        ///用户失效
        case AuthConstant.userOutDateErrorCode:{
            errorDesc=i18n.t("您的账户已过期，请联系管理员！");
            break;
        }
        case AuthConstant.userNotCorrectErrorCode:{
            errorDesc=i18n.t("新密码不符合密码策略");
            break;
        }
        case AuthConstant.tenantOutDateErrorCode:{
            errorDesc=i18n.t("您所属的租户无效，请联系管理员！");
            break;
        }
        /*y验证码无效*/
        case AuthConstant.captcheInvalidErrorCode:{
            errorDesc=i18n.t("验证码无效，请重新再试！");
            break;
        }
        case AuthConstant.captcheNotCorrectErrorCode:{
            errorDesc=i18n.t("验证码不正确，请重新输入！");
            break;
        }
        case AuthConstant.userNotMacthErrorCode:{
            errorDesc=i18n.t("用户不存在");
            break;
        }
        ///口令不正确
        case AuthConstant.otpCodeInvalidErrorCode:{
            errorDesc=i18n.t("口令有误，请重新获取后再登录！");
            break;
        }
        ///手机号或者邮箱 未在系统中注册
        case AuthConstant.otpUserNotFondErrorCode:{
            errorDesc=i18n.t("手机号或者邮箱未注册，请重新登录！");
            break;
        }
    }
    return  errorDesc;
}