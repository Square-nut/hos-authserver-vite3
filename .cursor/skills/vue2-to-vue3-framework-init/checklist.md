# Vue2 → Vue3 框架初始化进度

复制到新项目，按 Phase 勾选。主流程见 [SKILL.md](SKILL.md)。

**项目名**：____________  
**基准仓库**：hos-authserver-web-v3  
**开始日期**：____________

---

## Phase 0 盘点

- [ ] 列出所有 `globalProperties` 注入点
- [ ] 列出所有 mixins 及引用方
- [ ] 列出 Vuex 模块及迁移目标 Pinia store
- [ ] 列出 `require()` 动态加载点

---

## Phase 1 构建

- [ ] Vite + Vue3 依赖安装
- [ ] `VUE_APP_*` → `VITE_*`
- [ ] `vite.config.ts` alias / dedupe / proxy
- [ ] `env.d.ts` / tsconfig
- [ ] `npm run build-only` 通过

---

## Phase 2 入口

- [ ] `main.ts` 无 globalProperties
- [ ] i18n `legacy: false`
- [ ] Pinia + persistedstate
- [ ] `v-hasPermi` 指令注册
- [ ] HosBiz + ElementPlus 注册

---

## Phase 3 状态与 Composables

- [ ] Vuex 模块 → Pinia
- [ ] 删除 `store/*.js`（Vuex）
- [ ] `useCrypt` / `useHosBiz`；API 全部 `src/api/*.ts` + `fetchXxx`
- [ ] CA mixins → composables（如适用）
- [ ] 框架层无 mixins 引用

---

## Phase 4 API

- [ ] `src/axios/` 仅 `http` / `httpGet` / `httpPost`（无 loader）
- [ ] `src/api/*.ts` 按域拆分，全部 `fetchXxx`
- [ ] 删除 `apiRequest`、`useApi`、`legacy-index`、config builder
- [ ] `isSuccessCode` + `ApiResult<T>`
- [ ] 全仓无 `$api` / `apiRequest` / loader 字符串

---

## Phase 5 hos-biz

- [ ] dialog
- [ ] form + button
- [ ] pagination
- [ ] table（列 parser）
- [ ] hos-biz-table.vue
- [ ] select-table-v2
- [ ] pinia-bridge 订阅/取消
- [ ] JS 模块 `.d.ts`

---

## Phase 6 Layout / 框架组件

- [ ] LoginLayout
- [ ] GlobleLayout / TabLayout
- [ ] post-select / Slide-verify（如适用）
- [ ] `resolve-view-component.ts` + glob

---

## Phase 7 类型

- [ ] `shims-js.d.ts`
- [ ] `@types/*` devDependencies
- [ ] `npm run type-check` 通过
- [ ] `npm run build` 通过

---

## Phase 8 收尾

- [ ] `vue3-constraints.mdc` 启用
- [ ] hos-biz README 更新
- [ ] 团队知会：views 迁移另开任务

---

## 备注

```
（记录项目差异、阻塞项、环境特殊配置）
```
