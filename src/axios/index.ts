import Http from './http'

const apiClient = new Http({
  baseURL: import.meta.env.VITE_APP_BASE_URL || import.meta.env.VUE_APP_BASE_URL || '',
  timeout: Number(import.meta.env.VITE_APP_TIME_OUT || import.meta.env.VUE_APP_TIME_OUT || 10000),
  cache: false,
  emulateJSON: false,
})

export function apiRequest(key: string, params?: unknown, headers?: Record<string, string>) {
  return apiClient.request(key, params, headers)
}

export default apiRequest
