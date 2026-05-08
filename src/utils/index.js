import { v4 as uuid } from 'uuid'

/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string') {
      if (/^[0-9]+$/.test(time)) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function getQueryObject(url) {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}

/**
 * @param {string} input value
 * @returns {number} output value
 */
export function byteLength(str) {
  // returns the byte length of an utf8 string
  let s = str.length
  for (var i = str.length - 1; i >= 0; i--) {
    const code = str.charCodeAt(i)
    if (code > 0x7f && code <= 0x7ff) s++
    else if (code > 0x7ff && code <= 0xffff) s += 2
    if (code >= 0xdc00 && code <= 0xdfff) i--
  }
  return s
}

/**
 * @param {Array} actual
 * @returns {Array}
 */
export function cleanArray(actual) {
  const newArray = []
  for (let i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i])
    }
  }
  return newArray
}

/**
 * @param {Object} json
 * @returns {Array}
 */
export function param(json) {
  if (!json) return ''
  return cleanArray(
    Object.keys(json).map((key) => {
      if (json[key] === undefined) return ''
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    })
  ).join('&')
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach((v) => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

/**
 * @param {string} val
 * @returns {string}
 */
export function html2Text(val) {
  const div = document.createElement('div')
  div.innerHTML = val
  return div.textContent || div.innerText
}

/**
 * Merges two objects, giving the last one precedence
 * @param {Object} target
 * @param {(Object|Array)} source
 * @returns {Object}
 */
export function objectMerge(target, source) {
  if (typeof target !== 'object') {
    target = {}
  }
  if (Array.isArray(source)) {
    return source.slice()
  }
  Object.keys(source).forEach((property) => {
    const sourceProperty = source[property]
    if (typeof sourceProperty === 'object') {
      target[property] = objectMerge(target[property], sourceProperty)
    } else {
      target[property] = sourceProperty
    }
  })
  return target
}

/**
 * @param {HTMLElement} element
 * @param {string} className
 */
export function toggleClass(element, className) {
  if (!element || !className) {
    return
  }
  let classString = element.className
  const nameIndex = classString.indexOf(className)
  if (nameIndex === -1) {
    classString += '' + className
  } else {
    classString = classString.substr(0, nameIndex) + classString.substr(nameIndex + className.length)
  }
  element.className = classString
}

/**
 * @param {string} type
 * @returns {Date}
 */
export function getTime(type) {
  if (type === 'start') {
    return new Date().getTime() - 3600 * 1000 * 24 * 90
  } else {
    return new Date(new Date().toDateString())
  }
}

/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @return {*}
 */
export function debounce(func, delay, immediate = false) {
  let timeoutId // 用于保存定时器 ID

  // 返回的这个函数就是具有防抖功能的函数
  // 它接收任意数量的参数 (...args)
  return function (...args) {
    // 确保在正确的上下文中执行 func，这里保存了调用时的 this
    const context = this

    // 清除上一次的定时器
    // 每次调用时都清除，保证在 delay 时间内没有新调用时才执行
    clearTimeout(timeoutId)

    // --- 立即执行模式的逻辑 ---
    const callNow = immediate && !timeoutId // 首次调用且设置了 immediate

    if (callNow) {
      // 立即执行 func，并将参数和上下文传递进去
      func.apply(context, args)
      // 执行后，设置一个新的定时器，防止在 delay 期间再次被立即执行
      // 这个定时器会在 delay 后将 timeoutId 设为 null，允许下一次立即执行
      timeoutId = setTimeout(() => {
        timeoutId = null
      }, delay)
      return
    }

    // --- 非立即执行（默认）模式的逻辑 ---
    // 重新设置一个新的定时器
    timeoutId = setTimeout(() => {
      func.apply(context, args)
    }, delay)
  }
}

/**
 * This is just a simple version of deep copy
 * Has a lot of edge cases bug
 * If you want to use a perfect deep copy, use lodash's _.cloneDeep
 * @param {Object} source
 * @returns {Object}
 */
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'deepClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  Object.keys(source).forEach((keys) => {
    if (source[keys] && typeof source[keys] === 'object') {
      targetObj[keys] = deepClone(source[keys])
    } else {
      targetObj[keys] = source[keys]
    }
  })
  return targetObj
}

/**
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

/**
 * @returns {string}
 */
export function createUniqueString() {
  const timestamp = +new Date() + ''
  const randomNum = parseInt((1 + Math.random()) * 65536) + ''
  return (+(randomNum + timestamp)).toString(32)
}

/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    ele.className = ele.className.replace(reg, ' ')
  }
}

export const escapeRegexpString = (value = '') => String(value).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

/**
 * @function 判断变量是否在全局变量中定义
 * 已定义,返回全局变量值.未定义,返回环境变量值或undefined
 * @param {string} val 传入的变量名
 * @returns {string} 返回变量值
 */

export const returnGlobalValue = (val) => {
  return __hos.hasOwnProperty(val) ? __hos[val] : process.env[val]
}

/**
 * @function 返回全局定义或环境变量中的baseUrl
 * @returns {string} 返回变量值
 */

export const getBaseUrl = () => {
  return returnGlobalValue('VUE_APP_BASE_URL')
}

/**
 * @function isTrue 字符串'0','false','null','undefined'判断为false
 * @param {string|object} value
 * @returns {boolean} 返回变量的布尔值
 */

export const isTrue = (value) => {
  if (typeof value === 'string') {
    // 判断字符串是否为 'undefined' 'null' 'false' '0'
    if (value === 'undefined' || value === 'null' || value === 'false' || value === '0') {
      return false
    }
  } else if (typeof value === 'object') {
    // 判断对象是否为空对象
    if (Array.isArray(value)) {
      // 判断数组是否为空数组
      return value.length > 0
    } else {
      // 判断普通对象是否为空对象
      return Object.keys(value).length > 0
    }
  }
  // 其他情况直接返回布尔值
  return Boolean(value)
}

/**
 * @function 将key=value&key=value格式键值对转为object
 * @param {string} query 传入key=value&key=value格式键值对
 * @returns {object} 返回转换后的object
 */
export const queryToObj = (query) => {
  const obj = {}
  if (query) {
    query.split('&').forEach((pair) => {
      const [key, value] = pair.split('=')
      obj[key] = decodeURIComponent(value)
    })
  }
  return obj
}

/**
 * 检查数据是否为空，为空返回true
 * @param {value} any
 * @return {boolean} 检查是否为空
 */
export const isEmptyValue = (value) => {
  const checkDataEmptyDict = {
    string: (str) => !str,
    number: (num) => !num.toString(),
    Object: (obj) => Object.keys(obj).length === 0,
    Array: (arr) => arr.length === 0,
    function: () => false,
    undefined: () => true,
    boolean: (data) => !data,
    Null: () => true
  }
  let type = typeof value
  // 基础数据类型
  if (type !== 'object') return checkDataEmptyDict[type](value)
  // 引用数据类型 Object || Array || Function || null
  type = Object.prototype.toString.call(value).replace(/^\[object (\S+)\]$/, '$1')
  return checkDataEmptyDict[type](value)
}

/**
 * 判断当前环境
 * @returns {string} development | production
 */
export const getEnv = () => {
  return returnGlobalValue('NODE_ENV')
}

/**
 * 判断当前环境是否为开发环境
 * @returns {boolean}
 */
export const isDev = () => {
  return returnGlobalValue('NODE_ENV') === 'development'
}

/**
 * 根据当前是否为开发环境,决定是否开启强制单体登录
 * @returns {boolean}
 */
export const isForce = () => {
  return isDev() ? true : returnGlobalValue('isForceLocalLogin')
}

/**
 * 根据userAgent,判断当前系统
 * @returns {string}
 */
export const getOs = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('win')) return 'windows'
  if (userAgent.includes('linux')) return 'linux'
  if (userAgent.includes('mac')) return 'mac'
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios'
  if (userAgent.includes('android')) return 'android'
  return 'unknown'
}

/**
 * 根据userAgent,判断当前浏览器是否为IE及IE版本
 * @returns {string}
 */
export const getInternetExplorerVersion = () => {
  const ua = window.navigator.userAgent

  const msie = ua.indexOf('MSIE ')
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
  }

  const trident = ua.indexOf('Trident/')
  if (trident > 0) {
    // IE 11 => return version number
    const rv = ua.indexOf('rv:')
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)
  }

  const edge = ua.indexOf('Edge/')
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10)
  }

  // other browser
  return -1
}

/**
 * 根据uuidV4随机生成32位的uuid,并去掉uuid中的'-'
 * @returns {string}
 */
export const getUuid = () => {
  return uuid().replace(/[-]/g, '')
}
/**
 * 检查当前页面是否在iframe中运行
 * @returns {boolean} 如果页面在iframe中运行返回true，否则返回false
 */
export const checkIfInIframe = () => {
  let inIframe = false
  // 方法1: 比较window.self和window.top
  try {
    if (window.self !== window.top) {
      inIframe = true
    }
  } catch (e) {
    // 如果由于同源策略无法访问window.top，也会抛出异常
    inIframe = true
  }
  // 方法2: 检查window.frameElement
  if (!inIframe && window.frameElement) {
    inIframe = true
  }
  return inIframe
}

/**
 * 传入menuList菜单列表,递归过滤掉所有hidden:true的项
 * @param {Array} menuList   菜单列表
 * @returns {Array}
 */
export const filterMenu = (menuList) => {
  return menuList
    .filter((item) => !item.hidden)
    .map((item) => {
      if (item.children?.length) {
        item.children = filterMenu(item.children)
      }
      return item
    })
}

// 过滤掉菜单项中visible===false和withPermission===false的项
export const filterMenus = (menuList) => {
  if (!Array.isArray(menuList)) return []
  return menuList.reduce((result, node) => {
    if (node.visible && node.withPermission !== false) {
      const newNode = deepClone(node)
      if (node?.children?.length) {
        newNode.children = filterMenus(node.children)
      }
      result.push(newNode)
    }
    return result
  }, [])
}

/**
 * 解析Content-Disposition，提取纯净文件名（解决split截取不健壮问题）
 * @param {string} disposition 响应头content-disposition
 * @returns {string} 原始文件名（含引号/编码，未解码）
 */
function extractRawFileName(disposition) {
  if (!disposition) return '下载文件.xlsx'
  // 先拆分filename=，再过滤分号/空格等多余字符
  const namePart = disposition.split('filename=')[1]?.split(';')[0]?.trim() || ''
  return namePart || '下载文件.xlsx'
}

/**
 * 清理文件名：去引号 + 过滤非法字符（避免浏览器自动加下划线）
 * @param {string} fileName 原始文件名
 * @returns {string} 清理后的文件名
 */
function cleanFileName(fileName) {
  // 1. 移除首尾引号（兼容方案二的核心逻辑）
  const noQuoteName = fileName.replace(/^["'](.*)["']$/, '$1').trim()
  // 2. 过滤浏览器不支持的非法字符（根源解决下划线问题）
  const invalidChars = /[\\/:*?"<>|]/g
  return noQuoteName.replace(invalidChars, ' ').trim() || '下载文件.xlsx'
}

/**
 * 安全解码文件名（保留方案一的解码逻辑，解决中文乱码）
 * @param {string} fileName 清理后的文件名
 * @returns {string} 解码后的中文文件名
 */
function safeDecodeFileName(fileName) {
  try {
    // 方案一的核心解码逻辑（解决中文乱码），增加异常捕获
    return decodeURIComponent(escape(fileName))
  } catch (e) {
    // 解码失败则降级为直接解码（兼容部分场景）
    return decodeURIComponent(fileName)
  }
}

// 最终下载逻辑（整合版）
export const BlobDownLoad = (res, type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') => {
  try {
    // 1. 构建Blob（保留方案一的Excel类型，确保文件格式正确）
    const blob = new Blob([res.data], {
      type
    })

    // 2. 解析+清理+解码文件名（三步解决乱码+下划线）
    const rawFileName = extractRawFileName(res.headers['content-disposition'])
    const cleanName = cleanFileName(rawFileName)
    const finalFileName = safeDecodeFileName(cleanName)

    // 3. 生成下载链接（提前保存href，避免a.remove后丢失）
    const downloadHref = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = downloadHref
    a.download = finalFileName

    // 4. 必须添加到DOM（兼容Firefox等浏览器）
    document.body.appendChild(a)
    a.click()

    // 5. 安全清理资源（修复URL释放漏洞）
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadHref)
    }, 100)
  } catch (error) {
    console.error('Excel下载失败：', error)
    alert('文件下载失败，请重试！')
  }
}

// //解决了医为浏览器上下载文件多下划线的问题
// export const BlobDownLoad = (res, type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') => {
//   console.log('解决了医为浏览器上下载文件多下划线的问题', type)

//   // let blob = new Blob([res.data], {
//   //   type
//   // })
//   // const fileName = res.headers['content-disposition']?.split('filename=')[1]?.trim()
//   // const cleanFileName = fileName.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1') // 使用 decodeURIComponent 来安全解码
//   // const decodedName = decodeURIComponent(cleanFileName)

//   // const href = URL.createObjectURL(blob)
//   // const a = document.createElement('a')
//   // a.style.display = 'none'
//   // a.href = href
//   // a.download = decodedName // 直接设置原始文件名
//   // a.click()
//   // a.remove()
//   // URL.revokeObjectURL(a.href)

//   let blob = new Blob([res.data], {
//     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//   })
//   const fileName = res.headers['content-disposition'].split('filename=')[1]
//   const href = URL.createObjectURL(blob)
//   const a = document.createElement('a')
//   a.style.display = 'none'
//   a.href = href
//   a.download = decodeURIComponent(escape(fileName))
//   a.click()
//   a.remove()
//   URL.revokeObjectURL(a.href)
// }

/**
 * 属性获取工具函数
 * @param {Object} object - 要检索的对象
 * @param {String|Array} path - 属性路径 (如 'a.b.c' 或 ['a', 'b', 'c'])
 * @param {*} defaultValue - 如果解析值为 undefined，则返回此值
 */
export function getValue(object, path, defaultValue) {
  // 1. 如果 object 为空，直接返回默认值
  if (object === null || object === undefined) return defaultValue

  // 2. 将路径标准化为数组
  const pathArray = Array.isArray(path)
    ? path
    : path
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
        .filter(Boolean)

  // 3. 逐层迭代访问
  const result = pathArray.reduce((acc, key) => {
    return acc !== null && acc !== undefined ? acc[key] : undefined
  }, object)

  // 4. 如果结果是 undefined，返回默认值
  return result === undefined ? defaultValue : result
}
