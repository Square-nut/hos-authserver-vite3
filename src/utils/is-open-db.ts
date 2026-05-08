import { ElMessage } from 'element-plus'
import { getActivePinia } from 'pinia'
import i18n from '@/i18n'
import { useDeviceStore } from '@/stores/device'

const USER_CONSTANT = {
  IP: 'IP',
  Mac: 'MAC',
}

function readStorage(key: string): unknown {
  const raw = localStorage.getItem(key)
  if (raw === null) return null
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return value === 'true' || value === '1'
  }
  return false
}

function getDeviceStore() {
  try {
    if (!getActivePinia()) return null
    return useDeviceStore()
  } catch {
    return null
  }
}

/**
 * 登录前判断是否开启弹窗校验:
 * - 开启后, 若缺失 IP/MAC 且非 admin, 则提示并拦截登录
 */
export function isOpenDb(loginName?: string): boolean {
  const deviceStore = getDeviceStore()
  const openDbEnabled = deviceStore
    ? deviceStore.isOpenDb
    : toBoolean(readStorage('isOpenDb'))
  if (!openDbEnabled) return true

  const ip = deviceStore?.ip || readStorage(USER_CONSTANT.IP)
  const mac = deviceStore?.mac || readStorage(USER_CONSTANT.Mac)
  if ((!ip || !mac) && loginName !== 'admin') {
    ElMessage.warning(String(i18n.global.t('请安装并运行医为客户端管理程序！')))
    return false
  }
  return true
}
