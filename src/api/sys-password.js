
// 修改密码
export const changePassword = (params) => {
    return {
        url: '/security/update/password',
        method: 'post',
        data: params
    }
}

export const getPwdPolicy = () => {
    return {
        url: "/security/select-password-complex",
        method: 'get'
    }
}

export const useLastPwd = (data) => {
    return {
        url: '/security/continue/password',
        method: 'post',
        data:data
    }
}



export const ForcinggetPwdPolicy = () => {
    return {
        url: "/security/select-password-complex",
        method: 'get'
    }
}

export const validateOldPassword1 = (param) => {
  return {
      url: '/AuthPassword/check-old-password',
      method: 'post',
      data:param
  }
}
export const validateOldPassword2 = (param) => {
  return {
      url: '/updatePassword/AuthForcingPasswprd/check-old-password',
      method: 'post',
      data:param
  }
}