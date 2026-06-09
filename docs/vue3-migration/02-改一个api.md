# 02 — 改一个 API 调用

## 新写法（推荐，单层与多层均适用）

### 1. 在 api 模块里定义（若尚无则新建）

```ts
// 单层：src/api/xxx.ts
// 多层基建 api：@base/api/xxx.ts（一般不由业务改）
// 多层业务：放在本模块 api 目录，或调用基建已提供的 fetchXxx

import { httpGet, httpPost } from '@/axios'  // 路径按项目 alias 调整

export function fetchUserList(params: Record<string, unknown>) {
  return httpGet('/user/list', params)
}
```

### 2. 在 .vue 或 .ts 里使用

```ts
import { fetchUserList } from '@/api/xxx'
import { isSuccessCode } from '@/api/types'  // 若有

const { code, data, msg } = await fetchUserList({ page: 1 })
if (isSuccessCode(code)) {
  // 使用 data
}
```

## 旧写法 → 不要在新代码里用

| 删除 | 改为 |
|------|------|
| `this.$api('module.method', params)` | `import { fetchXxx } from '...'` |
| `apiRequest('module.method')` | 同上 |
| `useApi()` | 同上 |

## 多层过渡期

存量页面可暂时保留：

```js
this.$api('biz.foo.bar', params)
```

**新加或重写**的接口请用 `fetchXxx`，不要新写 `$api`。

不要删除 `@base/axios/loader.js` 或 `dynamic-loader.js`。

## hos-biz 表格数据

```vue
<!-- 旧 -->
<el-biz-table :table-data="'module.method'" ... />

<!-- 新 -->
<el-biz-table :table-data="loadData" ... />
```

```ts
import { fetchXxx } from '@/api/xxx'

function loadData(params: Record<string, unknown>) {
  return fetchXxx(params)
}
```

## 改完自测

- [ ] 网络面板接口 200 / 业务 code 成功
- [ ] 列表有数据或保存成功
- [ ] 控制台无 `$api is not a function` 等报错
