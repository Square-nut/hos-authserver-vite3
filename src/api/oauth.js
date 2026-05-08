// export const $config = {
//     baseURL: 'http://127.0.0.1:8006/api/',
//   }
  // 获取授权码 - 弃用
  export const getAuthorizeCode = (param) =>{
      return {
        url: '/oauth/auth/getAuthorizationCode',
        method: 'post',
        data: param,
        emulateJSON: true
      }
    }


    // 校验授权码
  export const checkToken = (param) =>{
    return {
      url: '/oauth/check_token',
      method: 'post',
      params: param
    }
  }

  // 获取授权码
export function authorize(params) {
  return {
    url: '/security/oauth2/authorize',
    method: 'get',
    params:params
  }
}

// 获取业务系统参数信息
export function info() {
  return {
    url: '/security/portal/authorize/info',
    method: 'post',
  }
}