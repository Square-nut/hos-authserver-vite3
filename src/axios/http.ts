import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import loader from './loader'
import { Interceptors } from './interceptors'

export type HttpOptions = AxiosRequestConfig & {
  cache?: boolean
  emulateJSON?: boolean
}

class HttpService {
  private axios: AxiosInstance

  constructor(private options: HttpOptions = {}) {
    this.axios = axios.create()
    new Interceptors(this.axios)
  }

  request(key: string, params?: unknown, headers?: Record<string, string>) {
    const { api, config } = loader(key)
    const apiConfig = api(params) || {}
    return this.requestConfig({ ...config, ...apiConfig }, headers)
  }

  /** 纯 Vue3 / api/*.ts：直接传 url、method，不经过 loader */
  requestConfig(
    config: AxiosRequestConfig & Pick<HttpOptions, 'cache' | 'emulateJSON'>,
    headers?: Record<string, string>,
  ) {
    const options: HttpOptions = { ...this.options, ...config }
    const method = (options.method || 'get').toLowerCase()
    const isGet = !['post', 'put', 'patch'].includes(method)

    if (isGet && options.cache === false) {
      options.params = { _t: Date.now(), ...(options.params as Record<string, unknown>) }
    }

    options.headers = { ...(options.headers || {}), ...(headers || {}) }

    if (options.data && options.emulateJSON) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
      options.data = new URLSearchParams(options.data as Record<string, string>).toString()
    }

    return this.axios.request(options)
  }
}

export default HttpService
