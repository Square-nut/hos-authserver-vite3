# Vue2 → Vue3 框架初始化进度

复制到新项目，按 Phase 勾选。主流程见 [SKILL.md](SKILL.md)。

**项目名**：____________  
**基准仓库**：hos-authserver-web-v3  
**开始日期**：____________

---

## Phase 0 盘点

- [ ] 列出 `globalProperties` / `$api` / mixins / Vuex
- [ ] 列出 `require()`、`loader`、`apiRequest` 引用
- [ ] `find src -name '*.js'` 统计待迁文件

---

## Phase 1 构建

- [ ] Vite + Vue3 依赖
- [ ] `VUE_APP_*` → `VITE_*`
- [ ] `vite.config.ts` / `env.d.ts` / tsconfig
- [ ] `npm run build-only` 通过

---

## Phase 2 入口

- [ ] `main.ts` 无 globalProperties
- [ ] i18n `legacy: false`
- [ ] Pinia + persistedstate
- [ ] `v-hasPermi`、HosBiz、ElementPlus

---

## Phase 3 状态与 Composables

- [ ] Vuex → Pinia
- [ ] `useCrypt` / `useHosBiz` / `useCaUk` / `useCaPin`
- [ ] **删除 `useApi.ts`**
- [ ] 框架层无 mixins

---

## Phase 4 API（纯 Vue3）

- [ ] `src/axios/` 仅 `http` / `httpGet` / `httpPost`
- [ ] 删除 `loader.ts`、`apiRequest`、`legacy-index.ts`
- [ ] `src/api/*.ts` 全部 `fetchXxx`（无 config builder）
- [ ] hos-biz `table-data` 仅函数
- [ ] 全仓无 `$api` / `apiRequest` / `useApi`

---

## Phase 5 hos-biz

- [ ] dialog → form → pagination → table → hos-biz-table → select-table-v2
- [ ] `pinia-bridge.ts` 订阅/取消
- [ ] 底层 `.js` → `.ts`（render 组件）

---

## Phase 6 Layout

- [ ] LoginLayout / GlobleLayout / TabLayout
- [ ] `resolve-view-component.ts` + glob

---

## Phase 7 全 TypeScript

- [ ] `permission.ts`
- [ ] `utils/**/*.ts`
- [ ] `i18n/langs/*.ts`
- [ ] `components/hos-biz/**/*.ts`
- [ ] 删除冗余 `.d.ts` 垫片与 copy 文件
- [ ] `find src -name '*.js'` → **0**
- [ ] `npm run type-check` + `npm run build` 通过

---

## Phase 8 收尾

- [ ] `vue3-constraints.mdc` + `api-http-conventions.mdc`
- [ ] README 更新（api / axios / hos-biz）
- [ ] views 业务迁移另开任务

---

## 备注

```
（记录项目差异、阻塞项、环境特殊配置）
```
