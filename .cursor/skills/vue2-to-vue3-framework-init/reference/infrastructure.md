# 基础设施改造参考

## 1. 构建与配置

### 核心依赖（hos-authserver-web-v3）

- `vue@3`、`vue-router@4+`、`pinia`、`pinia-plugin-persistedstate`
- `element-plus`、`vue-i18n@9+`（`legacy: false`）
- `vite`、`@vitejs/plugin-vue`、`vue-tsc`、`typescript`

### vite.config.ts

```ts
export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue', 'vue-router', 'pinia', 'element-plus'],
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
```

### 环境变量

| 旧 | 新 |
|----|-----|
| `VUE_APP_BASE_URL` | `VITE_APP_BASE_URL` |
| `process.env.VUE_APP_*` | `import.meta.env.VITE_*` |

`env.d.ts` 声明 `ImportMetaEnv`；`__hos` 来自 `public/environment.js`。

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

仅注册插件，**无 globalProperties**：

Pinia → Router → i18n → 指令 → ElementPlus → elementAliases → HosBiz → `import './permission'` → mount

---

## 3. i18n

- `src/i18n/index.ts`：`createI18n({ legacy: false })`
- 静态语言包：`src/i18n/langs/zh.ts`、`en.ts`（可选，v3 主要运行时加载）
- 登录页文案：`permission.ts` 中 `fetchI18nLoginPageConfig` + `mergeLocaleMessage`

---

## 4. Pinia Stores

| Store | 职责 |
|-------|------|
| `user.ts` | Token、Login/Logout |
| `loginSession.ts` | 登录页 i18n、岗位版本 |
| `hosBizTable.ts` / `hosBizDialog.ts` | hos-biz 刷新/弹窗 |
| `sys.ts` / `device.ts` | 系统、设备 |

hos-biz 通过 `useHosBiz.ts` 暴露，业务不直接 commit。

---

## 5. Composables（v3 清单）

| 文件 | 用途 |
|------|------|
| `useCrypt.ts` | 加解密 |
| `useHosBiz.ts` | 弹窗、表格刷新、登录会话写入 |
| `useCaUk.ts` / `useCaPin.ts` | CA UKey / PIN |
| `useElementBiz.ts` | Element 业务封装 |

**已移除**：`useApi.ts`（原 `$api` / loader 入口）

---

## 6. API / Axios（纯 Vue3，无 loader）

### 目录结构（v3）

```
src/axios/
├── http.ts           # HttpService.requestConfig
├── api-request.ts    # http / httpGet / httpPost
├── interceptors.ts
└── index.ts          # export { http, httpGet, httpPost }
```

**已删除**：`loader.ts`、`typed-request.ts`、`apiRequest`、`useApi.ts`、`legacy-index.ts`

### 请求链路

```
组件 → import { fetchXxx } from '@/api/<domain>'
     → httpGet / httpPost / http
     → interceptors → ApiResult<T>
```

### API 模块

- `src/api/*.ts`：按域拆分，函数命名 `fetchXxx`
- `src/api/index.ts`：re-export（避免重复 export 标识符）
- 响应：`isSuccessCode(code)` + `ApiResult<T>`

Rule：`.cursor/rules/api-http-conventions.mdc`

---

## 7. permission 与 router

- `src/permission.ts`：路由守卫（typed）；`fetchI18nLoginPageConfig` 加载登录 i18n
- `router/index.ts`：`createWebHistory(import.meta.env.BASE_URL)`
- 动态路由 `eval`：可暂留（build warning，非阻塞）
- 动态视图：`resolve-view-component.ts` + `import.meta.glob`

---

## 8. 常量与主题

- `constants/ui-theme.ts`：`UI_THEME`
- `constant/auth-constant.ts`、`constant/common-constant.ts`

---

## 9. 类型与 shims（v3 现状）

### src/ 全 TS

- `src/` 内 **0 个 `.js`**
- hos-biz 底层：`components/**/index.ts`、`utils/*.ts`（无需旁挂 `.d.ts`）

### 全局 shims

`src/shims-js.d.ts` — 仅第三方：

- `qs`、`qrcode`、`@/utils/theme/themeConfig`
- `Window.strServerRan`

`src/utils/utils-modules.d.ts` — `crypto-js`、`encryptlong`、`sm-crypto` 等（如需要）

### devDependencies

`@types/qrcode`、`@types/qs`、`@types/sortablejs`、`@types/node`

---

## 10. utils（全 TS）

| 模块 | 路径 |
|------|------|
| 通用 | `utils/index.ts` |
| 加解密 | `utils/crypt/*.ts` |
| MAC/websys | `utils/mac-util.ts`、`utils/websys.ts` |
| 权限指令 | `utils/permission/index.ts` |
| 校验 | `utils/validate.ts`、`utils/validateUtil.ts` |
| 存储 | `utils/ls.ts`、`utils/base/storage-util.ts` |

部分大文件可保留 `@ts-nocheck`，不阻断 `vue-tsc`。

---

## 11. Layout

| 文件 | 状态 |
|------|------|
| `LoginLayout.vue` | script setup + `UI_THEME` |
| `GlobleLayout.vue` / `TabLayout.vue` | script setup + `useRoute()` |

---

## 12. 加密

- `rsa-crypt.ts`：`import { JSEncrypt } from 'encryptlong'`
- `aes-md5-crypt.ts`：与 v2 对齐 MD5 key
- `index.ts`：统一 `crypt` / `decrypt` 导出

---

## 13. 验收

```bash
find src -name '*.js' | wc -l     # 0
rg "apiRequest|useApi|loader" src  # 无
npm run type-check && npm run build
```
