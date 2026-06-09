# 基础设施改造参考

> **范围**：本文仅 **基建**。业务页见 [`docs/vue3-migration/`](../../../../docs/vue3-migration/README.md)。  
> **Profile**：默认 **单层**；多层见 [multi-layer.md](multi-layer.md)。

## 1. 构建与配置

### 核心依赖（单层参考）

- `vue@3`、`vue-router@4+`、`pinia`、`pinia-plugin-persistedstate`
- `element-plus`、`vue-i18n@9+`（`legacy: false`）
- `vite`、`@vitejs/plugin-vue`、`vue-tsc`、`typescript`

### vite.config.ts（single-layer）

```ts
export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue', 'vue-router', 'pinia', 'element-plus'],
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
```

### vite.config.ts（multi-layer）

```ts
resolve: {
  dedupe: ['vue', 'vue-router', 'pinia'],
  alias: {
    '@': fileURLToPath(new URL('./src/biz', import.meta.url)),
    '@base': fileURLToPath(new URL('./src/sys/hos-app-base', import.meta.url)),
    '@core': fileURLToPath(new URL('./src/sys', import.meta.url)),
    '@src': fileURLToPath(new URL('./src', import.meta.url)),
    '@components': fileURLToPath(
      new URL('./src/sys/hos-app-base/components', import.meta.url)
    ),
  },
},
```

`package.json`：`"predev": "node bin/gen-loader-files.js"`（或保留原 `npm run gen`）。

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

## 6. API / Axios

### single-layer（纯 Vue3，无 loader）

目录结构（v3）：

```
src/axios/
├── http.ts           # HttpService.requestConfig
├── api-request.ts    # http / httpGet / httpPost
├── interceptors.ts
└── index.ts          # export { http, httpGet, httpPost }
```

**已删除**：`loader.ts`、`typed-request.ts`、`apiRequest`、`useApi.ts`、`legacy-index.ts`

请求链路：

```
组件 → import { fetchXxx } from '@/api/<domain>'
     → httpGet / httpPost / http
     → interceptors → ApiResult<T>
```

- `src/api/*.ts`：按域拆分，函数命名 `fetchXxx`
- `src/api/index.ts`：re-export（避免重复 export 标识符）
- 响应：`isSuccessCode(code)` + `ApiResult<T>`

Rule：`.cursor/rules/api-http-conventions.mdc`

### multi-layer（双轨 API）

**新代码**（与 flat 相同）：

```
import { fetchXxx } from '@base/api/<domain>'
  → httpGet / httpPost → interceptors
```

**存量 / 菜单配置**（保留 dynamic-loader）：

```
$api('lowCode.foo.bar') 或 loader(key)
  → @base/axios/loader.js
  → dynamicLoadApi(moduleName, path)   // src/dynamic-loader.ts
  → load-api.js（gen 生成，覆盖 base/biz/lowCode/originData）
```

迁移期允许两轨并存；最终新代码全部 `fetchXxx`，loader 仅服务存量 key。详见 [multi-layer.md §7](multi-layer.md#7-phase-4-补充api)。

---

## 7. permission 与 router

- `src/permission.ts`（或 `@base/permission.ts`）：路由守卫；`fetchI18nLoginPageConfig` 加载登录 i18n
- `router/index.ts`：`createWebHistory(import.meta.env.BASE_URL)`
- 动态路由 `eval`：可暂留（build warning，非阻塞）

**动态视图加载（按 Profile）**：

| Profile | 机制 |
|---------|------|
| single-layer | `resolve-view-component.ts` + `import.meta.glob` |
| multi-layer | `dynamicLoadViews` / `dynamicLoadLayout` + `load-views.js` / `load-layout.js`（gen 生成） |

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

### single-layer（基建路径）

```bash
# 排除 views
find src -path '*/views/*' -prune -o -name '*.js' -print | wc -l   # 0
rg "apiRequest|useApi|loader" src --glob '!src/views/**'
npm run type-check && npm run build
```

### multi-layer（基建路径）

```bash
# Shell + @base 非 views
rg "dynamicLoadApi|dynamicLoadViews" src
rg "apiRequest|useApi" src/sys/hos-app-base --glob '!**/views/**' --glob '!**/loader*'
npm run build
# 抽测：未改业务菜单可打开
```
