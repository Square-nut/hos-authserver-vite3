---
name: vue2-to-vue3-framework-init
description: >-
  Upgrade HOS-style Vue2 + Webpack business frameworks to Vue3 + Vite infrastructure
  (main, Pinia, API, composables, layout, hos-biz). Use when migrating framework/base
  code to Vue3, initializing a fork from hos-authserver-web, upgrading hos-biz,
  removing globalProperties/vuex/mixins, or running vue-tsc on non-views code.
  Excludes src/views/ business pages — use a separate views migration workflow.
---

# Vue2 → Vue3 框架初始化升级

基于 `hos-authserver-web-v3` 实践，将 **框架层**（不含 `src/views/`）从 Vue2 + Webpack 升级到 Vue3 + Vite + Pinia + TypeScript。

**日常约束（升级完成后）**：`.cursor/rules/vue3-constraints.mdc`

**详细参考**：
- [infrastructure.md](reference/infrastructure.md) — 入口、状态、API、i18n、类型
- [hos-biz.md](reference/hos-biz.md) — hos-biz 子组件改造顺序与契约
- [replacement-map.md](reference/replacement-map.md) — 旧写法 → 新写法对照
- [checklist.md](checklist.md) — 可勾选进度模板

---

## 范围

| 在范围内 | 不在范围内 |
|----------|------------|
| `main.ts`、`vite.config.ts`、env | `src/views/` 业务页（登录、OAuth 等） |
| `src/api/`、`src/axios/` | 全库一次性 Options API → script setup |
| Pinia stores、composables | 改 hos-biz cols 字段语义 / 换 Vben schema |
| `src/layout/`、`src/components/`（含 hos-biz） | 去掉 `uid` 刷新模型 / `el-biz-*` 别名 |
| `permission.js`、router、i18n | |
| `src/utils/`、`types/`、`shims-js.d.ts` | |

---

## 执行原则

1. **对外契约不变**：hos-biz `el-biz-table` / `openHosBizDialog` API 语义不改
2. **分阶段验收**：每 Phase 结束跑 `npm run build-only`；最终 `npm run type-check && npm run build`
3. **先基础设施、后组件**：hos-biz 顺序 dialog → form → pagination → table → hos-biz-table
4. **禁止新增** `globalProperties`、`mixins`、Vuex、`require`
5. **最小 diff**：只改 Vue3 兼容性，不顺手重构业务逻辑

---

## Phase 0：盘点

```bash
# 在项目根目录执行
rg "globalProperties|\$api|\$message|\$crypt|\$theme|\$ls|\$m\b" src --glob '!src/views'
rg "mixins:|vuex|mapState|mapGetters|this\.\$store" src --glob '!src/views'
rg "require\(" src --glob '!src/views'
rg "export default \{" src --glob '*.vue' --glob '!src/views/**'
```

记录并分组：globalProperties 注入点、mixins 文件、Vuex 模块、动态 `require` 视图加载。

**产出**：改造清单（可复制 [checklist.md](checklist.md)）

---

## Phase 1：构建与配置

1. **Vite + Vue3 依赖**：`vue@3`、`vue-router@4/5`、`pinia`、`element-plus`、`vue-i18n@9+`
2. **环境变量**：`VUE_APP_*` → `VITE_*`；代码用 `import.meta.env.VITE_*`
3. **`vite.config.ts`**：`@` alias、`dedupe: ['vue', ...]`、dev proxy（如需）
4. **TypeScript**：`vue-tsc --build`；`env.d.ts` 声明 `ImportMetaEnv`
5. **脚本**：`dev` / `build-only` / `type-check` / `build`（build 含 type-check）

验收：`npm run build-only` 能启动（允许 views 暂未改完时有运行时问题，但构建应通过）。

详见 [infrastructure.md § 构建](reference/infrastructure.md#1-构建与配置)。

---

## Phase 2：入口与全局插件

**目标 `main.ts` 形态**（仅注册，无 globalProperties）：

```ts
const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(i18n)          // legacy: false
app.directive('hasPermi', hasPermi)
app.use(ElementPlus, { locale: zhCn, size: 'small' })
app.use(elementAliases)
app.use(HosBiz)
app.mount('#app')
```

**必做**：
- i18n `legacy: false`；非组件用 `i18n.global.t()` / `mergeLocaleMessage`
- 删除 `$api` / `$message` / `$crypt` / `$theme` / `$ls` 等 plugin 注入
- `permission.js`：路由守卫保留；动态路由 `eval` 可暂留（build warning 可接受）

验收：`main.ts` 无 `globalProperties`；`grep globalProperties src/main.ts` 为空。

---

## Phase 3：状态与 Composables

### Pinia 替代 Vuex

| 旧 Vuex 模块 | 新 Pinia store |
|--------------|----------------|
| user | `stores/user.ts` |
| table / dialog（hos-biz） | `stores/hosBizTable.ts` / `hosBizDialog.ts` |
| 登录会话 | `stores/loginSession.ts` |

删除 `store/*.js`（Vuex）；删除 mixins（如 CA 的 `uk.js` / `pin.js`）。

### Composables 收口

| Composable | 替代 |
|------------|------|
| `useCrypt()` | `this.$crypt` |
| `useHosBiz()` | 表格刷新、弹窗开闭、登录会话写入 |
| `useCaUk()` / `useCaPin()` | CA mixins（框架层定义，views 调用） |

`useHosBiz.ts` 对外 API：

```ts
openHosBizDialog({ _uid, component, props })
closeHosBizDialog({ _uid })
refreshHosBizTable({ _uid })
updateHosBizTable({ _uid, ... })
```

业务代码 **禁止** 直接 commit Pinia hos-biz 内部 mutation。

验收：框架层无 `vuex` import；无 mixins 文件被 layout/components 引用。

---

## Phase 4：API 层

1. **`src/axios/`**：`http.ts` + `api-request.ts` + `interceptors.ts`（仅 `httpGet` / `httpPost` / `http`，**无 loader**）
2. **`src/api/*.ts`**：按域拆分，全部使用 `httpGet` / `httpPost` / `http`
3. **响应类型**：`ApiResult<T>` + `isSuccessCode(code)`
4. **`src/api/index.ts`**：re-export 各域模块
5. **hos-biz `table-data`**：仅支持函数 `(params) => fetchXxx(params)`，不支持字符串 key

API 迁移细节见 `migrate-api-to-ts` skill。

验收：全仓无 `apiRequest`、`useApi`、`loader`、`$api('...')`。

---

## Phase 5：hos-biz 改造

**原则**：cols + form + table-data + page + uid 对外不变。

**改造顺序**（详见 [hos-biz.md](reference/hos-biz.md)）：

1. `dialog` — `modelValue`、render 插槽、`subscribeHosBizDialogMutations`
2. `form` + `button` — `inheritAttrs`、`provide` FORM/TABLE
3. `pagination` — EP 事件名
4. `table` — `scopedSlots` → Vue3 slots 第三参
5. `hos-biz-table.vue` — Pinia bridge、`isSuccessCode`、`:deep()`
6. `select-table-v2` — `modelValue`、`inheritAttrs`

**Pinia bridge**：`pinia-bridge.js` + `onBeforeUnmount` 取消订阅。

验收：框架层 hos-biz 相关文件无 Vue2 API；登录壳/layout 能挂载 hos-biz 组件。

---

## Phase 6：Layout 与框架组件

| 组件 | 要点 |
|------|------|
| `LoginLayout.vue` | 主题分支用 `UI_THEME` / composable，非 `$theme` |
| `GlobleLayout.vue` / `TabLayout.vue` | `useRoute()`；localStorage 值用 string 比较 |
| `post-select*.vue` | `defineModel` / EP 组件 |
| `Slide-verify/` | touch 可选链、API 响应用 `isSuccessCode` |
| 动态视图 | `import.meta.glob` + `resolve-view-component.ts` |

Layout 改 `<script setup lang="ts">`；**不要求**此时改 views。

---

## Phase 7：类型收尾

1. **JS 模块旁补 `.d.ts`**：hos-biz table/form/pagination/store-config 等
2. **`shims-js.d.ts`**：permission、qs、qrcode、遗留 utils
3. **`@types/qrcode`、`@types/qs`** 等 devDependencies
4. **API 响应**：框架层 `(data ?? {}) as Record<string, unknown>`
5. **`axios` 返回**：必要时 `as unknown as Promise<ApiResult<T>>`

```bash
npm run type-check   # 目标：0 errors（views 若未改，可先 glob 排除或分批）
npm run build
```

---

## Phase 8：启用日常约束

1. 确认 `.cursor/rules/vue3-constraints.mdc` 已启用
2. 更新 `hos-biz/README.md` 产线文档（cols、刷新/弹窗 API）
3. 归档旧 `VUE3-MIGRATION-CHECKLIST.md` 状态列，改链到本 skill

---

## 常见问题

| 现象 | 处理 |
|------|------|
| `Duplicate identifier` in `api/index.ts` | 具名 export，勿重复 `export { xApi }` |
| hos-biz `./table` 无类型 | 同目录 `index.d.ts` |
| `isSuccessCode` 参数 unknown | `isSuccessCode(code as string \| number \| undefined \| null)` |
| localStorage `== 0` 类型错误 | 改为 `=== '0'` |
| EP Dialog 不显示 | 检查 `modelValue` / `v-model:visible` |
| build 中 permission eval warning | 可暂留，非阻塞 |

---

## 升级完成标准

- [ ] 框架层无 `globalProperties`、`vuex`、`mixins`、`require`
- [ ] `main.ts` 仅注册 Pinia/Router/i18n/EP/HosBiz
- [ ] composables 替代全部全局工具注入
- [ ] hos-biz 对外 API 未变
- [ ] `npm run type-check` 通过（含或不含 views，按项目阶段）
- [ ] `npm run build` 通过
- [ ] `vue3-constraints.mdc` 生效

**下一步**：按业务需要迁移 `src/views/`（登录、OAuth、报表页等），不在本 skill 范围。
