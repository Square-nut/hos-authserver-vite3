import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import apiRequest from './axios'

const app = createApp(App)
const pinia = createPinia()

const globalProperties = app.config.globalProperties as any
globalProperties.$api = apiRequest
globalProperties.$ls = {
  get(key: string) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: unknown) {
    try {
      window.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    } catch {
      // noop
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // noop
    }
  },
}

pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(i18n)

app.use(ElementPlus, { size: 'small', zIndex: 3000 })

app.mount('#app')
