import { defineStore } from 'pinia'
import apiRequest from '@/axios'
import i18n from '@/i18n'
import { useDeviceStore } from '@/stores/device'

const ACCESS_TOKEN_KEY = 'access-token'
const REFRESH_TOKEN_KEY = 'refresh-token'
const LOGIN_NAME_KEY = 'login-name'
const USER_INFO_KEY = 'user-info'
const USER_AUTH_KEY = 'user-auth'
const TENANT_ID_KEY = 'tenant-id'
const CACHE_INCLUDED_ROUTES_KEY = 'cache-included-routes'
const USER_CONSTANT = {
  IP: 'IP',
  HostName: 'HostName',
  Mac: 'MAC',
}

type LoginForm = Record<string, any>
type PermissionMenu = Record<string, any>

function setLocal(key: string, value: unknown) {
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
}

function getLocal<T = unknown>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return raw as T
  }
}

function removeLocal(key: string) {
  localStorage.removeItem(key)
}

function hasMac() {
  const deviceStore = useDeviceStore()
  return !!(deviceStore.mac || localStorage.getItem(USER_CONSTANT.Mac))
}

function clearLoginCache() {
  removeLocal(ACCESS_TOKEN_KEY)
  removeLocal(REFRESH_TOKEN_KEY)
  removeLocal(LOGIN_NAME_KEY)
  removeLocal(USER_INFO_KEY)
  removeLocal(CACHE_INCLUDED_ROUTES_KEY)
}

export const useUserStore = defineStore('user', {
  state: () => ({
    accessToken: '',
    loginStyle: {} as Record<string, unknown>,
    loginType: {},
    refreshToken: '',
    loginName: '',
    name: '',
    tenantId: '',
    avatar: '',
    menuList: [] as PermissionMenu[],
    dropDownMenus: [] as PermissionMenu[],
    info: {} as Record<string, unknown>,
    defaultPageData: {} as Record<string, unknown>,
  }),

  actions: {
    setLoginType(obj: Record<string, unknown>) {
      this.loginType = obj;
    },
    setLoginStyle(configObj: Record<string, unknown>) {
      this.loginStyle = configObj
    },
    setAccessToken(accessToken: string) {
      this.accessToken = accessToken
    },
    setRefreshToken(refreshToken: string) {
      this.refreshToken = refreshToken
    },
    setName(payload: { loginName: string; name: string }) {
      this.loginName = payload.loginName
      this.name = payload.name
    },
    setAvatar(avatar: string) {
      this.avatar = avatar
    },
    setMenuList(menuList: PermissionMenu[]) {
      this.menuList = menuList
    },
    setInfo(info: Record<string, unknown>) {
      this.info = info
    },
    setTenant(id: string) {
      this.tenantId = id
    },
    setDefaultPageData(data: Record<string, unknown>) {
      this.defaultPageData = data
    },
    resetUserState() {
      this.accessToken = ''
      this.refreshToken = ''
      this.menuList = []
      this.info = {}
    },

    async Login(loginForm: LoginForm) {
      const deviceStore = useDeviceStore()
      const headers: Record<string, string> = {}
      if (loginForm.grantType === 'captcha' || loginForm.grantType === 'otp') {
        headers['captcha-key'] = loginForm.grantChainId || ''
        headers['captcha-code'] = loginForm.captchaCode || ''
      }
      if (loginForm.selectRoleId) {
        headers['role-id'] = loginForm.selectRoleId
      }

      if ((window as any).__hos?.isForceMAC === true && !hasMac()) {
        throw {
          msg: i18n.global.t('未获取到MAC地址，请检查客户端是否正常运行！'),
          code: 'fe-custom-error-fe',
        }
      }

      const ip = deviceStore.ip || localStorage.getItem(USER_CONSTANT.IP)
      const mac = deviceStore.mac || localStorage.getItem(USER_CONSTANT.Mac)
      if (!ip || !mac) {
        try {
          const cmdResponse = (await apiRequest('websys.cmd')) as any
          if (String(cmdResponse?.status) === '200') {
            const config = JSON.parse(cmdResponse.rtn)
            setLocal(USER_CONSTANT.IP, config.IP)
            setLocal(USER_CONSTANT.HostName, config.HostName)
            setLocal(USER_CONSTANT.Mac, config.Mac)
            deviceStore.setDeviceInfo({
              ip: config.IP || '',
              hostName: config.HostName || '',
              mac: config.Mac || '',
            })
          }
        } catch {
          // ignore client probe failure; keep legacy behavior tolerant
        }
      }

      const response = (await apiRequest('login', loginForm, headers)) as any
      if (response?.code !== '200') {
        throw response
      }

      const result = response.data || {}
      setLocal(ACCESS_TOKEN_KEY, result.accessToken || '')
      setLocal(REFRESH_TOKEN_KEY, result.refreshToken || '')
      this.setAccessToken(result.accessToken || '')
      this.setRefreshToken(result.refreshToken || '')
      return response
    },

    async GetPermissionList() {
      const menuData: PermissionMenu[] = [
        {
          id: '952682c55e5f97ee555e75056da157b7',
          parentId: '0',
          ancestors: '[0]',
          code: 'iam',
          name: '首页',
          type: 'C',
          router: '',
          openType: '0',
          frame: false,
          visible: true,
          cache: true,
          icon: null,
          weight: 20,
          remark: null,
          categoryLocation: null,
          pageProperties: null,
          advancedJs: null,
          leaf: false,
        },
      ]
      if (!menuData.length) {
        throw new Error('getPermissionList: permissions must be a non-null array!')
      }
      sessionStorage.setItem(USER_AUTH_KEY, JSON.stringify(menuData))
      this.setMenuList(menuData)
      return {
        allMenus: menuData,
        singleRouters: [] as PermissionMenu[],
      }
    },

    async Logout(_params: Record<string, unknown> = {}) {
      try {
        await apiRequest('logout')
      } finally {
        this.resetUserState()
        clearLoginCache()
      }
    },

    async frontLogout() {
      this.resetUserState()
      clearLoginCache()
    },

    saveTenant(id: string) {
      setLocal(TENANT_ID_KEY, id)
      this.setTenant(id)
    },
  },
})
