# axios 目录说明（框架封装 · 慎改）

HTTP 基础设施。日常业务开发**一般不要修改**本目录。

---

## 能改 / 不能改

| 位置 | 你能不能改 |
|------|------------|
| **`src/api/*.ts`** | ✅ 加 `httpGet` / `httpPost` / `http` 封装 |
| **`src/axios/`** | ❌ 勿动 |
| **`.vue` / `stores`** | ✅ `import { fetchXxx } from '@/api/...'`，不要改拦截器 |

---

## 请求方式（唯一标准）

| 方法 | 用途 |
|------|------|
| `httpGet` / `httpPost` / `http` | **`src/api/*.ts`** 与组件直连调用 |

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

**不支持** loader key、`$api('module.method')`、`apiRequest('key')`。

---

## 文件职责

| 文件 | 作用 |
|------|------|
| `http.ts` | Axios 实例、`requestConfig` |
| `interceptors.ts` | 拦截器 |
| `api-request.ts` | `httpGet`、`httpPost`、`http` |
| `index.ts` | 统一导出 |

---

## 请求链路

```text
LoginLayout.vue
  → import { fetchLoginConfig } from '@/api/login'
  → httpGet('/security/loginConfig', { pageType })
  → 拦截器 → ApiResult<T>
```

AI 协作约定见 `.cursor/rules/api-http-conventions.mdc`。
