import type { AxiosRequestConfig } from 'axios'

type ApiBuilder = (params?: unknown) => AxiosRequestConfig
type ApiModule = Record<string, unknown> & { $config?: AxiosRequestConfig }

const jsModules = import.meta.glob('../api/**/*.js', { eager: true }) as Record<string, ApiModule>
const tsModules = import.meta.glob('../api/**/*.ts', { eager: true }) as Record<string, ApiModule>
const apiModules = { ...jsModules, ...tsModules }

function normalizeModule(module: ApiModule): ApiModule {
  const defaultPart = (module.default as Record<string, unknown> | undefined) || {}
  return { ...defaultPart, ...module }
}

function parseKey(key: string) {
  // Support both "module.method" and "method" (fallback to api/index)
  if (!key || typeof key !== 'string') {
    throw new Error('Invalid api key')
  }
  const hasModulePath = key.includes('.')
  if (!hasModulePath) {
    return { name: key, path: 'index' }
  }
  const keyArr = key.split('.')
  const name = keyArr.pop() || ''
  const path = keyArr.join('/') || ''
  if (!name || !path) {
    throw new Error('Invalid api key format, expected module.method')
  }
  // Support hyphenated modules like "forget-password.getPhone"
  const reg = /^[\w-]+(?:\/[\w-]+)*$/i
  if (!reg.test(path) || !/^[\w-]+$/i.test(name)) {
    throw new Error('Invalid api key format, expected module.method')
  }
  return {
    name,
    path,
  }
}

function resolveModule(path: string): ApiModule | null {
  const candidates = [
    `../api/${path}.ts`,
    `../api/${path}.js`,
    `../api/${path}/index.ts`,
    `../api/${path}/index.js`,
  ]
  for (const candidate of candidates) {
    if (apiModules[candidate]) return normalizeModule(apiModules[candidate])
  }
  return null
}

export default function loader(key: string) {
  const { name, path } = parseKey(key)
  const module = resolveModule(path)
  if (!module) {
    throw new Error(`API module not found: ${path}`)
  }
  const api = module[name] as ApiBuilder | undefined
  if (typeof api !== 'function') {
    throw new Error(`API method not found: ${key}`)
  }
  return {
    key,
    api,
    module,
    config: module.$config || {},
  }
}
