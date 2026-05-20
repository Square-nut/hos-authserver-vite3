# axios 目录说明（框架封装 · 慎改）

HTTP 基础设施。日常业务开发**一般不要修改**本目录。

---

## 能改 / 不能改

| 位置 | 你能不能改 |
|------|------------|
| **`src/api/*.ts`** | ✅ 加 `httpGet` / `httpPost` / `http` 封装 |
| **`src/axios/`** | ❌ 勿动 |
| **`.vue` / `stores`** | ✅ `import` from `@/api/xxx`，不要改拦截器 |

---

## 请求方式（标准）

| 方法 | 用途 |
|------|------|
| `httpGet` / `httpPost` / `http` | **`src/api/*.ts`** 与组件直连调用（推荐） |
| `apiRequest('loaderKey')` / `$api` | 遗留；**勿新增**；`src/api` 已无 `*.js` |

```ts
import { httpGet } from '@/axios'

export function fetchLangList() {
  return httpGet<LangOption[]>('/i18n/language/list-select')
}
```

组件：

```ts
import { fetchLangList } from '@/api/i18n'
const res = await fetchLangList()
```

---

## 文件职责

| 文件 | 作用 |
|------|------|
| `http.ts` | Axios 实例、`request`(loader)、`requestConfig`(直连) |
| `loader.ts` | 字符串 key → `api/*.ts`（兼容遗留 key） |
| `interceptors.ts` | 拦截器 |
| `api-request.ts` | `apiRequest`、`httpGet`、`httpPost`、`http` |
| `typed-request.ts` | `request(key)`，仅供过渡期 `services/` |
| `index.ts` | 统一导出 |

---

## 请求链路

```text
LoginLayout.vue
  → import { fetchLoginConfig } from '@/api/login'
  → httpGet('/security/loginConfig', { pageType })
  → 拦截器 → ApiResult<T>
```

AI 协作约定见项目根 `.cursor/rules/api-http-conventions.mdc`。
