import { defineStore } from 'pinia'

type I18nState = {
  language: string
  defaultLanguage: string,
  i18nStatus: boolean
}

export const useI18nStore = defineStore('i18n', {
  state: (): I18nState => ({
    language: '',
    defaultLanguage: '',
    i18nStatus: false
  }),
  actions: {
    setLanguage(language: string) {
      this.language = language
    },
    setDefaultLanguage(defaultLanguage: string) {
      this.defaultLanguage = defaultLanguage
    },
    setI18nStatus(status: boolean) {
      this.i18nStatus = status
    }
  },
  persist: {
    key: 'i18n-preference',
    storage: localStorage,
    pick: ['language', 'defaultLanguage'],
  },
})
