# 基础设施改造参考

## 1. 构建与配置

### 核心依赖（参考 hos-authserver-web-v3）

- `vue@3`、`vue-router@4+`、`pinia`、`pinia-plugin-persistedstate`
- `element-plus`、`vue-i18n@9+`（`legacy: false`）
- `vite`、`@vitejs/plugin-vue`、`vue-tsc`、`typescript`

### vite.config.ts 要点

```ts
export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue', 'vue-router', 'pinia', 'element-plus'],
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // dev proxy 按环境配置
})
```

### 环境变量

| 旧 | 新 |
|----|-----|
| `.env` 中 `VUE_APP_BASE_URL` | `VITE_APP_BASE_URL` |
| `process.env.VUE_APP_*` | `import.meta.env.VITE_*` |

`env.d.ts`：

```ts
interface ImportMetaEnv {
  readonly VITE_APP_BASE_URL: string
  // ...
}
declare const __hos: Record<string, unknown>  // environment.js 如有
```

### npm scripts

```json
{
  "dev": "vite",
  "build-only": "vite build",
  "type-check": "vue-tsc --build",
  "build": "run-p type-check \"build-only {@}\" --"
}
```

---

## 2. main.ts

**只做注册，不做 globalProperties 注入。**

注册顺序建议：Pinia → Router → i18n → 指令 → ElementPlus → elementAliases → HosBiz → mount。

删除项：
- `Vue.prototype` / `app.config.globalProperties`
- 旧 util plugin（`$m`）
- Vuex store
- 全局 mixin

保留项：
- `import './permission'`（路由守卫）
- `v-hasPermi` 指令（可从 `@/utils/permission` 直接注册）

---

## 3. i18n

`src/i18n/index.ts`：

```ts
const i18n = createI18n({
  legacy: false,
  locale: 'zh',
  messages: { ... },
})
```

非组件文件：
- `i18n.global.t('key')`
- `i18n.global.mergeLocaleMessage(locale, partial)`

---

## 4. Pinia Stores

| Store | 职责 |
|-------|------|
| `user.ts` | Token、用户信息、Login/Logout actions |
| `loginSession.ts` | 登录页 i18n 列表、岗位版本、portal URL |
| `hosBizTable.ts` | 表格 refresh/update/reload（替代 Vuex table） |
| `hosBizDialog.ts` | 弹窗 open/close（替代 Vuex dialog） |
| `sys.ts` / `i18n.ts` | 系统与语言配置 |

hos-biz store 使用 `store-config.js` 的 `commonTable` / `common`，通过 `useHosBiz.ts` 暴露，业务不直接调用 store action。

---

## 5. Composables

| 文件 | 导出 |
|------|------|
| `useCrypt.ts` | `useCrypt()` / `crypt` / `decrypt` |
| `useHosBiz.ts` | open/close dialog、refresh table、login session 写入 |
| `useCaUk.ts` | CA UKey 选择与签名（供 views 使用） |
| `useCaPin.ts` | CA PIN 验证 |
| `useElementBiz.ts` | Element 业务封装 |

---

## 6. API / Axios（纯 Vue3，无 loader）

```
src/api/<domain>.ts   → fetchXxx()
    ↓ httpGet / httpPost / http
src/axios/api-request.ts
    ↓
src/axios/http.ts → interceptors.ts
```

**禁止**：`loader.ts`、`apiRequest(key)`、`useApi()`、`$api('module.method')`、返回 `{ url, method }` 的 config builder。

### 类型

`src/types/api-common.ts`：

```ts
export interface ApiResult<T = unknown> {
  code?: string | number
  data?: T
  msg?: string
}
export function isSuccessCode(code: string | number | undefined | null): boolean
```

### index.ts 导出

避免：

```ts
export * from './staff'
export { staffApi } from './staff'  // Duplicate identifier
```

改为：要么 `export *`，要么具名列表（不含重复 Api 对象）。

---

## 7. permission 与 router

- `router/index.ts`：`createRouter` + `createWebHistory(import.meta.env.BASE_URL)`
- `permission.js`：beforeEach 守卫；动态路由加载可保留原有 eval（后续可 refactor）
- 动态视图：`src/utils/resolve-view-component.ts` + `import.meta.glob`

---

## 8. 常量与主题

- `src/constants/ui-theme.ts`：`UI_THEME` 枚举/常量，替代 `$theme`
- `src/constant/auth-constant.ts`：错误码（框架与 views 共用）

---

## 9. 类型与 shims

### JS 模块

在 `.js` 旁建 `.d.ts`（hos-biz 优先）：

```
components/hos-biz/components/table/index.js
components/hos-biz/components/table/index.d.ts
```

### 全局 shims

`src/shims-js.d.ts`：permission、qs、qrcode、validateUtil、crypt 等。

### devDependencies

```
@types/qrcode @types/qs @types/sortablejs @types/node
```

---

## 10. Layout（框架层）

| 文件 | 改造 |
|------|------|
| `LoginLayout.vue` | script setup；inject/provide 登录配置；内嵌 views/login/index（不改造 index 本身） |
| `GlobleLayout.vue` | `useRoute()`；SideMenu props 类型；string 比较 localStorage |
| `TabLayout.vue` | 同上 |

---

## 11. 加密 utils（如项目含 crypt）

- `rsa-crypt.js`：`import { JSEncrypt } from 'encryptlong'`（勿用旧 bin 路径）
- `aes-md5-crypt.js`：与 v2 对齐 MD5 key / sortObj
- `index.d.ts` 导出 crypt/decrypt 签名

---

## 12. 验收命令

```bash
npm run type-check
npm run build-only
npm run build
```

框架层 grep 确认：

```bash
rg "globalProperties|vuex|mixins:" src --glob '!src/views' -l
# 期望：无关键框架文件命中（或仅 permission 等待 refactor）
```
