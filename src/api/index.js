export const $config = {
	 //baseURL: 'http://localhost:8004/api'
   //baseURL: 'http://127.0.0.1:4523/mock/679250',
    //baseURL: 'http://114.251.193.138:8005/api/',
}


/**
 * 登录
 */
export const login = (params) => {
  return {
    url: `/security/token?grantType=${params.grantType}`,
    method: 'post',
    data: params
  }
}

///获取验证码

export const getCaptcha = (params) => {
  return {
    url: '/security/captcha',
    method: 'get'
  }
}

/**
 * 获取资源权限
 */
export const listMenu = () => {
  return {
    url: '/sys/resources/list-menu',
    ////url: '/sys/resources/list-all-menu',
    method: 'get',
  }
}

/**
 * 用户登录成功之后加载的配置信息
 * @returns 
 */
export const listConfig=()=>{
  return {
    url :"/sys/config/select-init",
    method:'get'
  }
}

////获取登录前的一些数据
export const getPreLoginData = (params) => {
  return {
    url: '/auth/pre-auth-data',
    method: 'get',
     params:params
  }
}
export const getOauthUrl = (source) => {
  return {
    url: `/social-auth/oauth/render/${source}`,
    method: 'get',
  }
}

///获取动态口令的编码
export const getOTPCode = (params) => {
  return {
    url: '/security/sms/sendValidate',
    method: 'get',
    params:params
  }
}
// id获取验证码
export const grantChainId = (params) => {
  return {
    url: '/otp-auth/otp-code/grantChainId',
    method: 'get',
    params:params
  }
}

// 退出方法
export function logout() {
  return {
    url: '/security/logout',
    method: 'post',
  }
}
// 获取登录配置信息，显示配置的登录页面
export function configPageType(params) {
  return {
    url: '/security/loginPage',
    method: 'get',
    params:params
  }
}
// 获取许可证信息
export const licenseState = (params) => {
  return {
    url: '/security/license/state',
    method: 'get',
    params:params
  }
}

// 判断登录方式  302 统一认证   200 单体登陆
export function authType(params) {
  return {
    url: '/security/authType',
    method: 'get',
    params:params
  }
}

// 获取登录方式
export function loginType() {
  return {
    url: '/security/loginType',
    method: 'get',
  }
}

/**
 * 获取页面语言包数据
 */
export const languageData = (params) => {
  return {
    url: '/i18n/element/get-elements',
    method: 'get',
    params: params
  }
}


//国际化语言下拉列表
export const getLangs = () => {
  return {
      url: '/i18n/language/list-select',
      method: 'get' 
  }
}
//国际化语言下拉列表
export const getLanguages = () => {
  return {
      url: '/i18n/language/select-Language',
      method: 'get' 
  }
}

/**
 * 获取页面语言包数据
 */
export const loginPageElements = (params) => {
  return {
    url: '/i18n/element/get-loginPageElements',
    method: 'get',
    params: params
  }
}

/**
 * 切换岗位
 */
export const changePost = (data) => {
  return {
    url: '/security/user/post',
    method: 'post',
    params: data
  }
}
/**
 * 获取预制页面权限数据
 */
export const elementAuthList = (params) => {
  return {
    url: '/sys/page-preset/column-perm/list-perm',
    method: 'get',
    params: params
  }
}

/**
 * 查询国际化是否开启
 */
export const isOpen = () => {
  return {
    url: '/i18n/config/is-open',
    method: 'get',
  }
}

/**
 * 查询医为弹窗是否开启
 */
export const dbDialogShowData = () => {
  return {
    url: '/sys/config/is-open-download-browser',
    method: 'get'
  }
}

/**
 * 获取岗位
 */
export const selectPostPage = (params) => {
  return {
    url: '/org/hos-post/select-post-page',
    method: 'get',
    params: params
  }
}

// 整合loginType和loginPage接口
export const getLoginConfig = (params) => {
  return {
    url: '/security/loginConfig',
    method: 'get',
    params: params
  }
}
