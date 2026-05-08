import { getActivePinia } from 'pinia'
import { useI18nStore } from '@/stores/i18n'

function getI18nStore() {
  try {
    if (!getActivePinia()) return null
    return useI18nStore()
  } catch {
    return null
  }
}

export function getCurrentLocale(): string | null {
  const store = getI18nStore()
  return store?.language || null
}

export function setCurrentLocale(locale: string): void {
  const store = getI18nStore()
  if (store) store.setLanguage(locale)
}

export function getDefaultLocale(): string | null {
  const store = getI18nStore()
  return store?.defaultLanguage || null
}

export function setDefaultLocale(locale: string): void {
  const store = getI18nStore()
  if (store) store.setDefaultLanguage(locale)
}

export function getLocale(): string {
  return getCurrentLocale() || getDefaultLocale() || 'zh'
}
