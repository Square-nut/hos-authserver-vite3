import { defineStore } from 'pinia'

type I18nState = {
  language: string
  defaultLanguage: string
}

export const useI18nStore = defineStore('i18n', {
  state: (): I18nState => ({
    language: '',
    defaultLanguage: '',
  }),
  actions: {
    setLanguage(language: string) {
      this.language = language
    },
    setDefaultLanguage(defaultLanguage: string) {
      this.defaultLanguage = defaultLanguage
    },
  },
  persist: {
    key: 'i18n-preference',
    storage: localStorage,
    pick: ['language', 'defaultLanguage'],
  },
})
