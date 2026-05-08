import { createI18n } from 'vue-i18n'
import { getLocale } from '@/utils/i18n/i18n-util'

function missingFunc(
  _locale: string,
  key: string,
  _vm: unknown,
  values?: unknown[] | Record<string, string> | string
) {
  const reg = /(?:\{)(.+?)(?=\})/g
  const arr = key.match(reg)
  if (!arr || (Array.isArray(values) && values.length === 0)) return key

  let currentKey = key
  for (let i = 0; i < arr.length; i++) {
    const content = arr[i]
    if (!content) continue
    const replaceContent = `{${arr[i]}}`
    if (Array.isArray(values) && typeof values[0] === 'object' && values[0] !== null) {
      const valueMap = values[0] as Record<string, string>
      currentKey = valueMap[content]
        ? currentKey.replace(replaceContent, valueMap[content])
        : currentKey
    } else {
      const valueMap = (values || {}) as Record<string, string>
      currentKey = valueMap[content]
        ? currentKey.replace(replaceContent, valueMap[content])
        : currentKey
    }
  }
  return currentKey
}

const i18n = createI18n({
  legacy: true,
  locale: getLocale(),
  missing: (locale, key, vm, values) => missingFunc(locale, key, vm, values),
  missingWarn: false,
  fallbackWarn: false,
  messages: {},
})

;(i18n as any).mergeLocaleMessage = (...args: [string, Record<string, string>]) =>
  i18n.global.mergeLocaleMessage(...args)

export default i18n
