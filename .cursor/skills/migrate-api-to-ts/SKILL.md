---
name: migrate-api-to-ts
description: >-
  Migrate legacy $api/apiRequest loader calls to src/api/*.ts with httpGet/httpPost.
  Use when adding APIs, refactoring $api('module.method'), or touching src/api or axios usage.
---

# 将 loader / $api 迁移到 src/api/*.ts

权威文档：`src/api/README.md`、`src/axios/README.md`。项目 Rule：`.cursor/rules/api-http-conventions.mdc`。

## 步骤

1. **定位旧定义**：在 git 历史或 `hos-authserver-web` 旧仓库找 `url`、`method`、`params`/`data`、`emulateJSON`、`baseURL`（`$config`）。
2. **新建或扩展** `src/api/<domain>.ts`：
   - GET → `httpGet(url, params)`
   - POST body → `httpPost(url, data, headers?)`
   - POST query / 特殊配置 → `http({ method, url, params, emulateJSON, baseURL })`
3. **命名**：`fetchXxx`，与域一致（如 `fetchQRData`）；导出 `xxxApi` 对象（可选）。
4. **更新调用方**：`.vue` / `stores` / `js` mixin → `import { fetchXxx } from '@/api/...'`，删除 `$api('...')`。
5. **聚合**：在 `src/api/index.ts` re-export。
6. **文档**：在 `src/api/README.md` 补充 loader key → 新函数一行（若来自历史迁移）。

## 行为对齐检查

- [ ] method、url 与旧版一致
- [ ] GET 用 `params`，POST body 用 `data`；旧版 POST+`params` 勿误改成 `data`
- [ ] `emulateJSON`、`baseURL` 已保留
- [ ] 全仓 `grep` 无残留 `$api('domain.method')`（该域）
- [ ] 不修改 `src/axios/`

## 示例

```ts
// 旧: $api('scan-code.getPhoneScan')
export function fetchPhoneScan() {
  return httpGet<unknown>('/security/scan/code')
}
```

```ts
// 旧: $api('ca.authPinPhone', upData) — POST + query params
export function fetchAuthPinPhone(params?: Record<string, unknown>) {
  return http({ method: 'post', url: '/security/ca/authPinPhone', params })
}
```
