# Vue2 → Vue3 基建进度

**范围**：仅基建。业务迁移见 [`docs/vue3-migration/`](../../../docs/vue3-migration/README.md)。

**项目名**：____________  
**开始日期**：____________

---

## Phase 0：Profile

- [ ] `moduleConfig.js`？→ single-layer / multi-layer
- [ ] 记录基建路径清单
- [ ] 选用下方 checklist

| 信号 | Profile |
|------|---------|
| 无 moduleConfig，`@`→`src/` | **single-layer** |
| 有 moduleConfig + dynamic-loader | **multi-layer** |

---

# 单层基建（single-layer）

## Phase 1 构建

- [ ] Vite + Vue3、`@`→`src/`
- [ ] `VITE_*` 环境变量
- [ ] `build-only` 通过

## Phase 2 入口

- [ ] `main.ts` 无 globalProperties
- [ ] Pinia、i18n、HosBiz、UI 库、permission

## Phase 3 Composables

- [ ] Vuex → Pinia（基建 stores）
- [ ] useCrypt / useHosBiz / useCaUk / useCaPin
- [ ] 基建无 mixins

## Phase 4 API

- [ ] axios 仅 httpGet/httpPost
- [ ] 删除 loader、useApi（**基建路径**）
- [ ] `@base` 级 api 用 fetchXxx

## Phase 5 hos-biz 内部

- [ ] dialog → form → pagination → table → hos-biz-table
- [ ] pinia-bridge

## Phase 6 路由 / Layout

- [ ] layout 组件 Vue3 化
- [ ] 未改 `views/*.vue` 仍能加载

## Phase 7 基建 TS

- [ ] `src/**` 排除 `views/` 无 `.js`
- [ ] 基建 `type-check` + `build`

## Phase 8 交付

- [ ] rules
- [ ] `docs/vue3-migration/` 五篇（按项目微调）
- [ ] README 指向业务手册

### 完成

- [ ] 一条未改业务菜单可打开
- [ ] hos-biz 契约未变

---

# 多层基建（multi-layer）

## Phase 1 构建

- [ ] 多 alias + `npm run gen`
- [ ] `build-only` 通过

## Phase 2 Shell

- [ ] main / App / moduleConfig / dynamic-loader
- [ ] 从 @base 拉基础设施
- [ ] 子产品 **仅 main 挂载**，不改子产品源码
- [ ] App.vue 基建 mixin → composable

## Phase 3–5 @base 非 views

- [ ] 同单层 Phase 3–5（路径在 `sys/hos-app-base/` 排除 views）
- [ ] permission.js 等根目录单文件已 TS 化

## Phase 4 API（多层）

- [ ] 保留 dynamic-loader
- [ ] @base 新 api 用 fetchXxx

## Phase 6 路由

- [ ] dynamicLoadViews/Layout 可加载 **未改** 各模块 views
- [ ] 不要求改 @base/views 或子产品

## Phase 7 基建 TS

- [ ] Shell + @base 非 views 无 `.js`
- [ ] **不要求** low-code / origin-data / biz / views 无 js

## Phase 8 交付

- [ ] rules + `docs/vue3-migration/`（含 04-多层alias）
- [ ] 业务手册路径与项目 alias 已核对

### 完成

- [ ] 各模块未改业务菜单可打开
- [ ] dynamic-loader 正常
- [ ] hos-biz 契约未变

---

## 明确不做（业务组）

- [ ] ~~@base/views 全量 script setup~~
- [ ] ~~low-code / origin-data / biz 内部改造~~
- [ ] ~~全仓 type-check 零 js~~

---

## 备注

```
Profile：____________
UI 库 Vue3：____________
```
