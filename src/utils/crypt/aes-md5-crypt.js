import CryptoJS from 'crypto-js'
// md5密钥
const md5Key = '11111'

// AES密钥 需要用到的16位字符串的key
const AESKey = '1234567890123456qwertyuiopasdfgh'
/**
 * MD5加密
 * @param {*} config 请求体对象
 * @returns
 */
const encryptMD5 = (config) => {
  const { data, params, pathVariable } = config
  let str = 'secret=' + md5Key + '#' + signatureSort(data, params, pathVariable)
  config.headers['signature'] = CryptoJS.MD5(str).toString();
  config.headers['timestamp'] = new Date().getTime()
  return config;
}
/**
 * AES加密
 * @param {*} data 待加密的字符串
 * @returns
 */
const encryptAES = (data) => {
  const dataBytes = CryptoJS.enc.Utf8.parse(data);
  const keyBytes = CryptoJS.enc.Utf8.parse(AESKey);
  const encrypted = CryptoJS.AES.encrypt(dataBytes, keyBytes, {
    iv: keyBytes,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encodeURIComponent(CryptoJS.enc.Base64.stringify(encrypted.ciphertext));
}
/**
 * AES解密
 * @param {*} data 待解密的字符串
 * @returns
 */
const decryptAES = (data) => {
  const keyBytes = CryptoJS.enc.Utf8.parse(AESKey);
  const decrypted = CryptoJS.AES.decrypt(data, keyBytes, {
    iv: keyBytes,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return CryptoJS.enc.Utf8.stringify(decrypted);
}

/**
 * 对象根据key首字母排序，转为key1=value1#key2=value2的形式
 * @param {} obj
 */
const sortObj = (obj) => {
  let newkey = Object.keys(obj).sort()
  let newObj = {}
  newkey.forEach((item) => {
    // if (obj[item]) {
    newObj[item] = obj[item]
    // }
  })
  let str = []
  for (let k in newObj) {
    // if (newObj[k]) {
    str.push(k + "=" + newObj[k]);
    // }
  }
  return str.length > 0 ? str.join("#") : str.join("")
}
/**
 * 签名排序，按照data，params，pathvalue的顺序
 * @param {*} data
 * @param {*} params
 * @param {*} pathVariable 自定义的字段，保存接口url上变量的值。
 */
const signatureSort = (data, params, pathVariable) => {
  let newDataStr = '', newParamsStr = '', newPathStr = '', newArr = [], newStr = ''
  if (data) {
    newDataStr = JSON.stringify(data)
    if (newDataStr) {
      newArr.push(newDataStr)
    }
  }
  if (params) {
    newParamsStr = sortObj(params)
    if (newParamsStr) {
      newArr.push(newParamsStr)
    }
  }
  if (pathVariable) {
    newPathStr = sortObj(pathVariable)
    if (newPathStr) {
      newArr.push(newPathStr)
    }
  }

  return newStr = newArr.join("#")
}

export default {
  encryptMD5,
  encryptAES,
  decryptAES,
  sortObj
}
