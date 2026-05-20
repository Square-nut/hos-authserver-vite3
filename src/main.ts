import './assets/main.css'
import './assets/login-page-layout.css'
import './assets/style/login-hos-theme.css'
import './assets/style/element-biz-table.css'

if (import.meta.env.VITE_APP_THEME_STYLE === '1') {
  import('./assets/style/hos/index.scss')
} else {
  import('./assets/style/simple/index.scss')
}

import { createApp } from 'vue'
import HosBiz from '@/components/hos-biz'
import elementAliases from '@/plugins/element-aliases'
import { registerHosElementAliases } from '@/plugins/hos-element-aliases'
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
globalProperties.$ls = ls

pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(i18n)

app.use(ElementPlus, { size: 'small', zIndex: 3000, locale: zhCn, })
app.use(elementAliases)
registerHosElementAliases(app)
app.use(HosBiz)

app.mount('#app')
