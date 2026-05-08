// 根据手机号获取短信验证码
export const getPhoneCode = (params) => {
    return {
        url:"/security/sms/sendValidate",
        method: "get",
        params
    }
}
// 效验短信验证码
export const validateForgetCode = (data) => {
    return {
        url:"/security/forget/check-sms",
        method: "post",
        data
    }
}

// 忘记密码修改密码接口
export const editPass = (data) => {
    return {
        url: "/security/forget/password",
        method: "post",
        data
    }
}

// 通过工号获取手机号
export const getPhone = (params) => {
    return {
        url: "/security/forget/get-phone?loginName=" + params.loginName,
    }
}