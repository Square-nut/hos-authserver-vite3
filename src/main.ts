import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import apiRequest from './axios'
import { ls } from '@/utils/ls'

const app = createApp(App)
const pinia = createPinia()

const globalProperties = app.config.globalProperties as any
globalProperties.$api = apiRequest
globalProperties.$t = (...args: any[]) => (i18n.global.t as any)(...args)
globalProperties.$ls = ls

pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(i18n)

app.use(ElementPlus, { size: 'small', zIndex: 3000, locale: zhCn, })

app.mount('#app')
