/**
 * 以下是登录相关的常量
 */
const AuthConstant = {
    passwordError:{
        "001":"第一次登录需要修改密码",
        "002":"强制修改密码",
        "003":"密码过期，请修改密码",
        "JYP001":"密码长度不够",
        "JYP002":"密码复杂度不够",
        "JYP003":"密码长度和复杂度不够",
    },
    socialErrorCode:"4005",
    socialErrorCodeSec:"4006",
    tokenErrorCode:"4001",///token失效
    tokenNotFondCode:"4000",///token为空
    captchaNeedOpenCode:"101-002-004-020",
    passwordErrorCode:"4002",
    twoAuthErrorCode:"4100",
    forcedJumpSetPassword:"101-002-005-", // 包含这个前缀的强制跳转修改密码页面
};

export default AuthConstant;
