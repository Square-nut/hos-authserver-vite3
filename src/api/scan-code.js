// 获取扫码登录二维码
export const getPhoneScan = () => {
    return {
      url: '/security/scan/code',
      method: 'get',
    }
}
  // 获取扫描结果
export const getPhoneScanStatus = (params) => {
    return {
      url: '/security/scan/status',
      method: 'get',
      params:params
    }
}
  
// --------------------------------------------------

// 获取扫码配置
export const getScanConfig = () => {
    return {
      url: '/hosIamLoginModel/get-scan-config',
      method: 'get',
    }
}
// 保存配置信息
export const saveScanConfig = (data) => {
    return {
      url: '/hosIamLoginModel/save-scan-config',
      method: 'post',
      data:data
    }
}