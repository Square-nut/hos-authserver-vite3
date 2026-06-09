---
name: migrate-api-to-ts
description: >-
  Add or migrate HTTP APIs to src/api/*.ts with httpGet/httpPost/http.
  Use when adding APIs, refactoring legacy $api calls, or touching src/api or axios usage.
---

# API 开发（纯 Vue3 + TS）

权威文档：`src/api/README.md`、`src/axios/README.md`。项目 Rule：`.cursor/rules/api-http-conventions.mdc`。

**本项目已无 loader / `$api` / `apiRequest`。** 所有接口必须通过 `src/api/*.ts` + `httpGet` / `httpPost` / `http`。

## 新增或迁移步骤

1. **定位旧定义**：在 git 历史或 `hos-authserver-web` 旧仓库找 `url`、`method`、`params`/`data`、`emulateJSON`、`baseURL`。
2. **新建或扩展** `src/api/<domain>.ts`：
   - GET → `httpGet(url, params)`
   - POST body → `httpPost(url, data, headers?)`
   - POST query / 特殊配置 → `http({ method, url, params, emulateJSON, baseURL })`
3. **命名**：`fetchXxx`，与域一致；导出 `xxxApi` 对象（可选）。
4. **更新调用方**：`.vue` / `stores` → `import { fetchXxx } from '@/api/...'`。
5. **聚合**：在 `src/api/index.ts` re-export。

## 行为对齐检查

- [ ] method、url 与旧版一致
- [ ] GET 用 `params`，POST body 用 `data`
- [ ] `emulateJSON`、`baseURL` 已保留
- [ ] 全仓无 `$api`、`apiRequest`、`useApi`
- [ ] 不修改 `src/axios/`

## hos-biz 表格数据源

```ts
// table-data 必须是函数
const loadData: TableDataFn = (params) => fetchSelectPostPage(params)
```

## 示例

```ts
export function fetchPhoneScan() {
  return httpGet<unknown>('/security/scan/code')
}
```

```ts
export function fetchAuthPinPhone(params?: Record<string, unknown>) {
  return http({ method: 'post', url: '/security/ca/authPinPhone', params })
}
```
