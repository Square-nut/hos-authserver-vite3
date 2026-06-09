---
name: vue2-to-vue3-framework-init
description: >-
  Upgrade HOS-style Vue2 + Webpack business frameworks to Vue3 + Vite + TypeScript
  (main, Pinia, pure httpGet/httpPost API, composables, hos-biz, full src TS).
  Use when migrating framework/base code to Vue3, forking from hos-authserver-web-v3,
  removing globalProperties/vuex/mixins/loader, or running vue-tsc on non-views code.
  Excludes src/views/ business logic — use a separate views migration workflow.
---

# Vue2 → Vue3 框架初始化升级

基于 **`hos-authserver-web-v3` 标杆实现**，将 **框架层**（不含 `src/views/` 业务语义改造）从 Vue2 + Webpack 升级到 Vue3 + Vite + Pinia + **全 TypeScript**。

**日常约束**：`.cursor/rules/vue3-constraints.mdc`、`.cursor/rules/api-http-conventions.mdc`

**详细参考**：
- [infrastructure.md](reference/infrastructure.md) — 入口、状态、API、i18n、类型
- [hos-biz.md](reference/hos-biz.md) — hos-biz 子组件改造顺序与契约
- [replacement-map.md](reference/replacement-map.md) — 旧写法 → 新写法对照
- [ts-migration.md](reference/ts-migration.md) — `src/` JS → TS 转换规则
- [checklist.md](checklist.md) — 可勾选进度模板

**配套 skill**：`migrate-api-to-ts`（API 开发与迁移）

---

## v3 标杆状态（2025-06）

`hos-authserver-web-v3` 框架层已达成：

| 项 | 状态 |
|----|------|
| `src/**/*.js` | **0**（仅 `public/ca/*.js`、`public/environment.js` 保留） |
| axios | 纯 `httpGet` / `httpPost` / `http`，**无 loader / apiRequest / useApi** |
| composables | `useCrypt`、`useHosBiz`、`useCaUk`、`useCaPin`（无 `useApi`） |
| hos-biz 底层 | 全部 `.ts`（`defineComponent` + `h()` render） |
| utils / permission | 全部 `.ts`（`permission.ts` 路由守卫） |
| i18n langs | `zh.ts` / `en.ts`；运行时 `mergeLocaleMessage` |
| 验收 | `npm run type-check` + `npm run build` 通过 |

---

## 范围

| 在范围内 | 不在范围内 |
|----------|------------|
| `main.ts`、`vite.config.ts`、env | `src/views/` 业务逻辑语义改造 |
| `src/api/`、`src/axios/`（纯 TS HTTP） | 全库一次性 Options API → script setup |
| Pinia stores、composables | 改 hos-biz cols 字段语义 / 换 Vben schema |
| `src/layout/`、`src/components/`（含 hos-biz） | 去掉 `uid` 刷新模型 / `el-biz-*` 别名 |
| `permission.ts`、router、i18n | `public/ca/*.js` CA 厂商脚本 |
| `src/utils/` 全 TS 化 | |

---

## 执行原则

1. **对外契约不变**：hos-biz `el-biz-table` / `openHosBizDialog` API 语义不改
2. **纯 Vue3 栈**：无 loader、无 `$api`、无 `globalProperties`、无 Vuex、无 mixins
3. **分阶段验收**：每 Phase 结束 `npm run build-only`；最终 `type-check && build`
4. **先基础设施、后组件**：hos-biz 顺序 dialog → form → pagination → table → hos-biz-table
5. **全 TS**：`src/` 除 `public/ca` 外无 `.js`（见 [ts-migration.md](reference/ts-migration.md)）

---

## Phase 0：盘点

```bash
rg "globalProperties|\$api|\$message|\$crypt|\$theme|\$ls|\$m\b" src --glob '!src/views'
rg "mixins:|vuex|mapState|mapGetters|this\.\$store" src --glob '!src/views'
rg "require\(|apiRequest|useApi|loader" src
rg "export default \{" src --glob '*.vue' --glob '!src/views/**'
find src -name '*.js' ! -path '*/ca/*'
```

**产出**：改造清单（[checklist.md](checklist.md)）

---

## Phase 1：构建与配置

1. Vite + Vue3：`vue@3`、`vue-router@4+`、`pinia`、`element-plus`、`vue-i18n@9+`
2. 环境变量：`VUE_APP_*` → `VITE_*`；`import.meta.env.VITE_*`
3. `vite.config.ts`：`@` alias、`dedupe: ['vue', ...]`
4. TypeScript：`vue-tsc --build`；`env.d.ts`

详见 [infrastructure.md §1](reference/infrastructure.md#1-构建与配置)。

---

## Phase 2：入口与全局插件

```ts
// main.ts — 仅注册，无 globalProperties
const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(i18n)          // legacy: false
app.directive('hasPermi', hasPermi)
app.use(ElementPlus, { locale: zhCn, size: 'small' })
app.use(elementAliases)
app.use(HosBiz)
import './permission'  // → permission.ts
app.mount('#app')
```

删除：`$api` / `$message` / `$crypt` / `$theme` / `$ls` plugin 注入。

---

## Phase 3：状态与 Composables

| 旧 | 新 |
|----|-----|
| Vuex user | `stores/user.ts` |
| Vuex table/dialog | `stores/hosBizTable.ts` / `hosBizDialog.ts` |
| `this.$crypt` | `useCrypt()` |
| CA mixins | `useCaUk()` / `useCaPin()` |
| hos-biz 弹窗/表格 | `useHosBiz()` |

**无 `useApi()`** — API 一律 `import { fetchXxx } from '@/api/...'`。

---

## Phase 4：API 层（纯 Vue3，无兼容）

```
src/api/<domain>.ts  →  fetchXxx()
    ↓ httpGet / httpPost / http
src/axios/api-request.ts → http.ts → interceptors.ts
```

**必须删除**：`loader.ts`、`apiRequest`、`useApi.ts`、`legacy-index.ts`、返回 `{ url, method }` 的 config builder。

**hos-biz `table-data`**：仅函数 `(params) => fetchXxx(params)`。

详见 `migrate-api-to-ts` skill 与 [infrastructure.md §6](reference/infrastructure.md#6-api--axios纯-vue3无-loader)。

验收：

```bash
rg "apiRequest|useApi|loader\.ts|legacy-index" src
# 期望：无命中
```

---

## Phase 5：hos-biz 改造

对外契约不变；底层全部 `.ts` + Vue3 render。顺序见 [hos-biz.md](reference/hos-biz.md)。

1. dialog → 2. form/button → 3. pagination → 4. table → 5. hos-biz-table.vue → 6. select-table-v2

`pinia-bridge.ts` + `onBeforeUnmount` 取消订阅。

---

## Phase 6：Layout 与框架组件

`LoginLayout` / `GlobleLayout` / `TabLayout` → `<script setup lang="ts">`  
动态视图 → `import.meta.glob` + `resolve-view-component.ts`

---

## Phase 7：`src/` 全 TypeScript 化

将 `src/` 内剩余 `.js` 改为 `.ts`（**排除 `public/ca`**）。分批顺序见 [ts-migration.md](reference/ts-migration.md)：

1. `permission.ts`、`constant/*.ts`
2. `utils/**/*.ts`（含 `crypt/`、`permission/`）
3. `i18n/langs/*.ts`
4. `components/hos-biz/**/*.ts`（render 组件用 `defineComponent` + `h()`）
5. `views/**/js/*.ts`（login 错误码等小模块）

删除冗余：`.d.ts` 垫片（类型内联到 `.ts`）、`is-open-db.js` 重导出、`websys.addins copy.js` 等。

`shims-js.d.ts` 仅保留第三方库（`qs`、`qrcode` 等）。

```bash
find src -name '*.js' | wc -l   # 目标：0
npm run type-check && npm run build
```

---

## Phase 8：启用日常约束

1. `.cursor/rules/vue3-constraints.mdc`
2. `.cursor/rules/api-http-conventions.mdc`
3. `hos-biz/README.md`、`src/api/README.md`、`src/axios/README.md`

---

## 常见问题

| 现象 | 处理 |
|------|------|
| `Duplicate identifier` in `api/index.ts` | 避免 `export *` 与具名 export 重复 |
| `isSuccessCode` 参数 unknown | `as string \| number \| undefined \| null` |
| localStorage `== 0` | 改为 `=== '0'` |
| `crypt()` 返回 `string \| false \| null` | 赋值时用 `\|\| ''` |
| hos-biz 复杂 utils 类型难推 | 可暂留 `@ts-nocheck`，不阻断 build |
| permission `eval` warning | 动态路由遗留，非阻塞 |

---

## 升级完成标准

- [ ] `src/` 无 `.js`（`public/ca` 除外）
- [ ] 无 `globalProperties`、`vuex`、`mixins`、`require`、`loader`、`useApi`
- [ ] axios 仅 `httpGet` / `httpPost` / `http`
- [ ] hos-biz 对外 API 未变
- [ ] `npm run type-check` + `npm run build` 通过
- [ ] `vue3-constraints.mdc` + `api-http-conventions.mdc` 生效

**下一步**：`src/views/` 业务页迁移（另开任务或专项 skill）。
