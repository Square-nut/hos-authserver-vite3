// @ts-nocheck
import UserConstant from '@/constant/user-constant'
import { returnGlobalValue, getOs } from '@/utils'
import { ls } from '@/utils/ls'
import { useSysStore } from '@/stores/sys'
import { fetchWebsysCmd } from '@/api/websys'
import { fetchDbDialogShowData } from '@/api/sys'
import Qs from 'qs'

function setShowDbDialog() {
  try {
    useSysStore().SET_SHOW_DBDIALOG(Boolean(ls.get('isOpenDb')))
  } catch {
    /* Pinia 未就绪时忽略 */
  }
}

export const hasMac = () => {
  if (ls.get('MAC')) {
    return true
  } else {
    return false
  }
}

// Windows系统下获取IpMac方法.
async function getIpMac() {
  // 判断sessionStorage里是否有Ip和Mac字段.如果没有则调用接口去获取
  const IP = ls.get(UserConstant.IP)
  const Mac = ls.get(UserConstant.Mac)
  if (IP && Mac) return { [UserConstant.IP]: IP, [UserConstant.Mac]: Mac }
  let resolve
  const promise = new Promise((res) => (resolve = res))
  try {
    const { status, rtn } = await fetchWebsysCmd()
    if (status == '200') {
      const config = JSON.parse(rtn)
      ls.set(UserConstant.IP, config.IP)
      ls.set(UserConstant.HostName, config.HostName)
      ls.set(UserConstant.Mac, config.Mac)
      resolve(config)
    }
  } catch (error) {
    // error表示获取cmd的接口报错,可能是未安装或未运行.在此处进行弹窗提醒
    setShowDbDialog()
  }
  return promise
}

// Linux系统下,则使用ws连接,获取IpMac.
async function initializeApplication() {
  // 判断sessionStorage里是否有Ip和Mac字段.如果没有则调用接口去获取
  const IP = ls.get(UserConstant.IP)
  const Mac = ls.get(UserConstant.Mac)
  if (IP && Mac) return { [UserConstant.IP]: IP, [UserConstant.Mac]: Mac }
  // 仅在第一次ws连接失败时,弹出提示框.
  let first = true
  let addinsWs = null
  let resolve
  const promise = new Promise((res) => (resolve = res))
  const init = () => {
    addinsWs?.close()
    addinsWs = null
    addinsWs = new WebSocket('ws://localhost:31996/websocket')
    const data = [
      { _dllDir: '/' },
      { _version: '' },
      { _clientIPExp: '' },
      { M_GetConfig: 'P_COUNT=0' },
      { _timeout: 60000 },
      { _ass: 'cmd' },
      { _cls: 'cmd' },
      { _senderId: 'S' + Math.random() }
    ]
    addinsWs.onopen = () => {
      addinsWs.send(JSON.stringify(data))
    }
    addinsWs.onmessage = (e) => {
      let { data } = e
      if (data && typeof data === 'string') {
        data = JSON.parse(data)
      }
      if (data.status == '200') {
        const { rtn } = data
        ls.set(UserConstant.IP, rtn.IP)
        ls.set(UserConstant.Mac, rtn.Mac)
        ls.set(UserConstant.HostName, rtn.HostName)
        resolve(rtn)
      }
    }
    addinsWs.onerror = (e) => {
      // error表示获取ws的接口报错,可能是未安装或未运行.在此处进行弹窗提醒
      first && setShowDbDialog()
      first = false
      init()
    }
    window.onbeforeunload = function () {
      addinsWs?.close()
      addinsWs = null
    }
  }
  init()
  return promise
}

// 如果query里传入了Ip Mac HostName,则直接放在Storage里
function setIpMac() {
  // 将所有键转为小写,处理query中可能存在大小写混乱的情况
  function normalizeKeys(obj) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key.toLowerCase()] = obj[key]
      return acc
    }, {})
  }

  // 解析url的查询参数（忽略'?'前缀）
  const query = Qs.parse(location.search, { ignoreQueryPrefix: true })

  // 根据是否存在redirect参数，获取最终需要的查询参数对象
  let searchObj = query
  if (query.redirect) {
    // 如果存在redirect, 从redirect参数中获取?后面的字符串进行解析
    const redirectQuery = query.redirect.split('?')[1] || ''
    const redirectObj = normalizeKeys(Qs.parse(redirectQuery))
    if (redirectObj.ip && redirectObj.mac) searchObj = redirectObj
  }

  // 将对象的键全部转为小写
  searchObj = normalizeKeys(searchObj)

  // 从归一化后的对象中获取ip, mac, hostname
  const { ip = '', mac = '', hostname = '' } = searchObj
  // 如果ip和mac都存在, 则保存到缓存中
  if (ip && mac) {
    ls.set(UserConstant.IP, ip)
    ls.set(UserConstant.Mac, mac)
    ls.set(UserConstant.HostName, hostname)
    return { [UserConstant.IP]: ip, [UserConstant.Mac]: mac }
  }
}

// 进入路由之前先根据不同系统获取IpMac.
export async function initWebsys() {
  const os = getOs()
  // 新版websys客户端使用ws进行连接.若使用新版客户端,需开启此配置,并通过ws获取Ip和Mac.
  const websysWs = returnGlobalValue('VITE_APP_WEBSYS_WS')
  let isOpenDb = ls.get('isOpenDb')
  // 未被接口赋值时,默认值为null.若不是boolean,表示还未请求接口获取数据.因此先请求接口.
  if (typeof isOpenDb !== 'boolean') {
    const { code, data } = await fetchDbDialogShowData()
    if (code == '200') {
      ls.set('isOpenDb', data)
      isOpenDb = data
    }
  }
  // 此处判断全等于false,确保是接口返回的boolean
  // 注释此行代码,不论是否开启isOpenDb,均获取Ip Mac.
  // if (isOpenDb === false) return

  // 若开启此配置或为Linux系统,则使用ws连接.
  if (websysWs || os === 'linux') {
    return initializeApplication()
  } else if (os === 'windows') {
    // Windows系统
    return getIpMac()
  }
}

let first = true
// 判断是否开启了isForceMAC强制使用Mac地址.如果开启了强制使用MAC地址,则必须await到MAC地址才放行
export async function isForceMac(wait = returnGlobalValue('isForceMAC')) {
  // 仅在首次调用时执行,确保只会执行一次
  if (!first) {
    const IP = ls.get(UserConstant.IP)
    const Mac = ls.get(UserConstant.Mac)
    return { [UserConstant.IP]: IP, [UserConstant.Mac]: Mac }
  }
  first = false

  const result = setIpMac()
  if (result) return result
  if (!wait) {
    initWebsys()
  } else {
    return await initWebsys()
  }
}
