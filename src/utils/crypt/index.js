import aes from "./aes-md5-crypt"
import rsa from "./rsa-crypt"
import sm4 from "./sm-crypt"


const resolveCryptType = () =>
	import.meta.env.VITE_APP_CRYPT_TYPE ??
	import.meta.env.VUE_APP_CRYPT_TYPE ??
	'rsa'

const crypt = (params, cryptType = resolveCryptType()) => {
  let cryptParam = null;
  switch (cryptType) {
    case "aes":
      cryptParam = aes.encryptAES(params)
      break;
    case "sm4":
      cryptParam = sm4.encryptSM(params)
      break;
    case "rsa":
      cryptParam = rsa.encryptRSA(params)
      break;
  }
  return cryptParam;
}

const decrypt = (params, cryptType = resolveCryptType()) => {
  let cryptParam = null;
  switch (cryptType) {
    case "aes":
      cryptParam = aes.decryptAES(params)
      break;
    case "sm4":
      cryptParam = sm4.decryptSM(params)
      break;
    case "rsa":
      cryptParam = rsa.decryptRSA(params)
      break;
  }
  return cryptParam;
}
/**
 * @description: 2021-05-14 请求参数首尾去空格
 * @param {*} data
 * @return {*}
 */
const isTrim = (data)=> {
  // 首先需要判断当前的config中是否存在data值
  if (data && data instanceof Object) {
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        // 此处我们不要使用   let element = data[key] 注意  如果采用这种方式的话对应trim改变的值和data[key]将不再会是一个同一个内存地址
        // 在需要判断一下当前数据是否是数组
        if (Array.isArray(data[key])) {
          // 就将数组放进去
          data[key] = isTrim(data[key])
        } else if (data[key] && data[key] instanceof Object) {
          // 如果对象里面套对象的话
          data[key] = isTrim(data[key])
        } else if (data[key] && Object.prototype.toString.call(data[key]) == '[object String]') {
          // 如果对象里面的数据是String的话那么就直接trim只对String进行操作
          data[key] = data[key].trim()
        }
      }
    }
    return data
  } else if (data && Object.prototype.toString.call(data) == '[object String]') {
    // 如果是字符串说明是JSON.parse需要转换
    // let dataObj = JSON.parse(data)
    // 转成对象之后在抛出去
    // dataObj = isTrim(dataObj)
    return data.trim()
  } else if (data && data instanceof Array) {
    // 如果是数组  那就forin一下  判断里面的数据类型
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        if ((data && data instanceof Object) || (data && data instanceof Array)) {
          data[key] = isTrim(data[key])
        }
      }
    }
    return data
  }
}


export default {
  crypt,
  decrypt,
  isTrim
}
