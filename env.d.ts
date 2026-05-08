/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_THEME_STYLE?: string
  readonly VITE_APP_BASE_URL?: string
  readonly VITE_APP_TIME_OUT?: string
  readonly VUE_APP_BASE_URL?: string
  readonly VUE_APP_TIME_OUT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
