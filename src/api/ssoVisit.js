export const $config = {
  emulateJSON: false,
}
/**
 * 获取单点登录系统列表
 */
export const getSystemList = () => {
  return {
    url: '/sso/ssoVisits/systemList',
    method: 'post',
  }
}
//保存个性化设置
export const save = (param) => {
    return {
      url: '/sso/personalConfigs/save',
      method: 'post',
      data: param
    }
  }
//应用程序插件下载
export const systemExeDownload = (param) => {
  return {
    url: '/sso/ssoVisits/systemExeDownload',
    method: 'post',
    params: param
  }
}
//获取角色列表
export const roleList = (param) => {
  return {
    url: '/sso/ssoVisits/roleList',
    method: 'post',
    params: param
  }
}
//保存cs程序的下载记录
export const saveInstall = (param) => {
  return {
    url: '/sso/programRecords/save',
    method: 'post',
    params: param
  }
}

//获取用户在应用系统下的角色列表
export const getRoleList = (param) => {
  return {
    url: '/sso/ssoVisits/roleList',
    method: 'post',
    params: param
  }
}


