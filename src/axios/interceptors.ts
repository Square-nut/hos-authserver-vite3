import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { getLocale } from '@/utils/i18n/i18n-util'

const USER_CONSTANT = {
  IP: 'IP',
  Mac: 'MAC',
}

export class Interceptors {
  constructor(private instance: AxiosInstance) {
    this.initInterceptors()
  }

  private initInterceptors() {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => this.onRequest(config),
      (error: AxiosError) => Promise.reject(error)
    )
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error: AxiosError<{ message?: string }>) => {
        const data = error.response?.data
        return Promise.reject(data || error)
      }
    )
  }

  private onRequest(config: InternalAxiosRequestConfig) {
    const locale = new URLSearchParams(window.location.search).get('language') || getLocale()
    if (locale) config.headers.language = locale

    const ip = window.localStorage.getItem(USER_CONSTANT.IP)
    const mac = window.localStorage.getItem(USER_CONSTANT.Mac)
    if (ip) config.headers['client-ip'] = ip
    if (mac) config.headers['client-mac'] = mac

    return config
  }
}

export type { AxiosRequestConfig }
