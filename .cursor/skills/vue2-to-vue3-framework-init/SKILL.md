---
name: vue2-to-vue3-framework-init
description: >-
  Build HOS Vue3 infrastructure (基建) only: Shell, @base non-views, build,
  dynamic-loader, Pinia, composables, hos-biz internals. Auto-detects
  single-layer vs multi-layer. Business views and sub-products are NOT in scope
  — hand off to docs/vue3-migration for one-by-one migration by other devs.
---

# Vue2 → Vue3 基建建设

**本 Skill 仅负责基建** + **制定转换规则**。业务页、子产品由其他同事按文件/按业务渐进迁移，见 [`docs/vue3-migration/`](../../../docs/vue3-migration/README.md)。

将 **基建** 从 Vue2 + Webpack 升级到 Vue3 + Vite + Pinia + TypeScript，并保证 **未改造的业务 `.vue` 仍可通过 dynamic-loader / 路由加载**（Vue3 兼容 Options API）。

---

## 基建范围（Definition of Done 边界）

### 单层（single-layer）

| 算基建 ✅ | 不算基建 ❌（交业务组） |
|-----------|-------------------------|
| `src/main.ts`、`App.vue`、构建配置 | `src/views/**` |
| `src/` 下除 `views/`：`api/`、`axios/`、`router/`、`stores/`、`layout/`、`components/`（含 hos-biz **内部**）、`utils/`、`composables/`、`permission.ts`、`i18n/` 等 | |

### 多层（multi-layer）

| 算基建 ✅ | 不算基建 ❌（交业务组） |
|-----------|-------------------------|
| **Shell**：`main.js`、`App.vue`、`moduleConfig.js`、`dynamic-loader.js`、`load-*.js`（gen）、`bin/gen-loader-files.js` | `@base/views/**` |
| **`@base` 非 views**：`api/`、`axios/`、`router/`、`store/`、`components/`（含 hos-biz 内部）、`utils/`、`i18n/`、`directive/`、`mixins/`（基建内消化）、`assets/`、`styles/`、根目录 `permission.js`、`defaultSettings.js`、`public-path.js`、`log.js`、`printSettings.js`、`version.js` 等 | `sys/low-code/**`、`sys/origin-data/**`、`biz/**` |
| Shell 中对子产品的 **最小挂载**（`app.use(widgetPlugins)`），不迁子产品内部 | |

---

## 结构 Profile

| Profile | 识别特征 |
|---------|----------|
| **single-layer** | 无 `moduleConfig.js`，`@` → `src/` |
| **multi-layer** | 有 `moduleConfig.js` + `dynamic-loader`，`@` → 子目录 |

**详细参考**：
- [infrastructure.md](reference/infrastructure.md)
- [multi-layer.md](reference/multi-layer.md)
- [hos-biz.md](reference/hos-biz.md) — hos-biz **内部**改造
- [replacement-map.md](reference/replacement-map.md) — 基建改写对照
- [ts-migration.md](reference/ts-migration.md) — **基建路径** JS → TS
- [checklist.md](checklist.md)

**业务组手册**：[`docs/vue3-migration/`](../../../docs/vue3-migration/README.md)（小上下文 / 古法编程可用）

**配套 skill**：`migrate-api-to-ts`

---

## 单层标杆（基建已完成的对照）

| 项 | 状态 |
|----|------|
| 基建路径无 `.js` | 是（`public/ca` 除外） |
| axios（单层） | 纯 `httpGet` / `httpPost`，无 loader |
| composables | `useCrypt`、`useHosBiz`、`useCaUk`、`useCaPin` |
| hos-biz 内部 | `.ts` + Vue3 render；**对外契约不变** |
| 验收 | 基建范围 `type-check` + `build`；**不要求** `views/` 全改 |

---

## 执行原则

1. **只做基建**；`views/` 与子产品交给 `docs/vue3-migration`
2. **对外契约不变**：hos-biz `el-biz-table` / `openHosBizDialog` 用法不变
3. **未改业务页能跑**：dynamic-loader / router 仍能懒加载 Options API `.vue`
4. **Profile 分叉**：单层删 loader；多层保留 dynamic-loader（见 [multi-layer.md](reference/multi-layer.md)）
5. **基建路径全 TS**；非基建可保留 `.js` / Options API 直至业务组改造
6. **规则交付**：Phase 8 发布 `docs/vue3-migration/` + `.cursor/rules/`

---

## Phase 0：盘点与 Profile 识别

```bash
test -f src/moduleConfig.js && echo "multi-layer signal"
rg "alias|resolve\(" vue.config.js vite.config.ts 2>/dev/null

# 仅盘点基建路径（单层示例）
rg "globalProperties|vuex|mixins" src --glob '!**/views/**' --glob '!src/sys/low-code/**' --glob '!src/sys/origin-data/**' --glob '!src/biz/**'
```

产出：[checklist.md](checklist.md) 勾选 Profile。

---

## Phase 1：构建与配置

### single-layer

Vite + Vue3 + Pinia + UI 库 + i18n；`@` → `src/`；`VUE_APP_*` → `VITE_*`。

### multi-layer

多 alias（`@base`、`@core`、`@src` 等）；`predev`/`prebuild` 执行 `npm run gen`。

详见 [infrastructure.md §1](reference/infrastructure.md#1-构建与配置)、[multi-layer.md](reference/multi-layer.md)。

---

## Phase 2：入口（Shell + main）

### single-layer

```ts
const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(HosBiz)
import './permission'
app.mount('#app')
```

无 `globalProperties`；无 `$api` plugin（单层）。

### multi-layer

- 从 `@base` 引入 router / store / i18n / axios / permission
- **最小集成**：`main.ts` 里 `app.use` 注册子产品插件（保证能启动），**不**改子产品源码
- `App.vue` 基建相关 mixin → composable
- `bizMain(app)` 签名更新

详见 [multi-layer.md §6](reference/multi-layer.md#6-phase-2-补充入口)。

---

## Phase 3：状态与 Composables（基建）

Vuex → Pinia；`useCrypt` / `useHosBiz` / `useCaUk` / `useCaPin`。基建内无 mixins。

---

## Phase 4：API 层（基建）

**single-layer**：`src/axios/` + `src/api/*.ts`，删除 loader / `useApi`。

**multi-layer**：`@base/axios` 保留 dynamic-loader；`@base/api` 新代码用 `httpGet`/`httpPost`；存量 `$api` key 由 loader 解析（业务页可继续用，见业务手册）。

---

## Phase 5：hos-biz 内部（基建）

仅 `@base/components/hos-biz`（或单层 `src/components/hos-biz`）。顺序见 [hos-biz.md](reference/hos-biz.md)。业务页用法写入 [03-hos-biz用法.md](../../../docs/vue3-migration/03-hos-biz用法.md)。

---

## Phase 6：路由与 Layout（基建）

**single-layer**：`layout/` + `resolve-view-component`（加载 **未改** 的 `views/*.vue`）。

**multi-layer**：`@base/router` + `dynamicLoadViews/Layout`；须能加载各模块 **未改造** 的 views。不要求改 `@base/views` 或子产品页面。

---

## Phase 7：基建路径 TypeScript 化

**仅基建目录** `find … -name '*.js' → 0`（`public/ca` 除外）。

| Profile | 范围 |
|---------|------|
| single-layer | `src/**` 排除 `views/` |
| multi-layer | Shell + `@base/**` 排除 `views/` |

`views/`、low-code、origin-data、biz **不在此 Phase**。

---

## Phase 8：规则交付

1. `.cursor/rules/vue3-constraints.mdc`、`api-http-conventions.mdc`
2. **`docs/vue3-migration/`** 五篇小文档（已提供模板，按项目微调路径）
3. `hos-biz/README.md`、`src/api/README.md` — 注明「业务迁移见 docs/vue3-migration」

---

## 基建完成标准

### 共同

- [ ] 基建路径无 `globalProperties`、Vuex、mixins（hos-biz 内部已处理）
- [ ] hos-biz 对外 API 未变
- [ ] `npm run build` 通过
- [ ] 抽一条未改业务菜单能打开、无阻断性红错
- [ ] `docs/vue3-migration/` 已就绪

### single-layer 额外

- [ ] 基建无 loader / `$api` / `useApi`
- [ ] 基建路径 `type-check` 通过

### multi-layer 额外

- [ ] dynamic-loader 可解析各注册模块（含未改 views）
- [ ] alias 与 Vue2 一致
- [ ] 基建新 API 用 `httpGet`/`httpPost`

---

## 不在本 Skill（业务组）

- `@base/views/**`、`low-code/**`、`origin-data/**`、`biz/**` 的逐文件 / 逐业务改造
- 全仓 `type-check` 零警告
- 子产品内部 widget 全面 script setup 化

**业务组入口**：[`docs/vue3-migration/README.md`](../../../docs/vue3-migration/README.md)
