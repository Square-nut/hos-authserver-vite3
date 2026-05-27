# hos-biz Vue3 + TS 改造 Checklist

> **原则**：对外用法不变（`cols` + `form` + `table-data` + `page` + `uid`），只做运行时与类型升级。  
> **范围**：`src/components/hos-biz/` + `stores/hosBiz*.ts` + `composables/useHosBiz.ts` + 别名/样式。  
> **不做的**：换 Vben schema、拆成每页 composable 手写三件套、改 cols 字段语义。

---

## 0. 对外契约（改造前后必须一致）

产线页面继续这样用，**本清单不以修改下列 API 为目标**：

```vue
<el-biz-table
  :uid="'report-xxx'"
  :cols="cols"
  :form="form"
  :table-data="loadData"
  :page="pageConfig"
  @after-load="onAfterLoad"
>
  <template #form>...</template>
  <template #toolbar>...</template>
</el-biz-table>
```

| 能力 | 调用方式 |
|------|----------|
| 刷新表格 | `refreshHosBizTable({ _uid })` / `useHosBiz().refreshTable` |
| 打开弹窗 | `openHosBizDialog({ _uid, component, props })` |
| 关闭弹窗 | `closeHosBizDialog({ _uid })` |
| 注册名 | `el-biz-table` / `el-biz-dialog` / `el-biz-button` / `el-biz-select-table-2` |

---

## 1. 基础设施（全局）

| # | 项 | 状态 | 说明 |
|---|----|------|------|
| 1.1 | `main.ts` 注册 `HosBiz` | ✅ | `app.use(HosBiz)` |
| 1.2 | hos-biz 直接使用 Element Plus 组件 | ✅ | `element-plus-resolve.js`，已移除 `hos-element-aliases` |
| 1.3 | `globalProperties.$theme` | ✅ | 供 `hos-biz-table` 判断 0/1/2 主题 |
| 1.4 | `globalProperties.$message` | ✅ | 遗留 Options 页 `this.$message` |
| 1.5 | Pinia `hosBizTable` / `hosBizDialog` | ✅ | 替代 Vuex `table`/`dialog` 模块 |
| 1.6 | `composables/useHosBiz.ts` 收口 | ✅ | 业务勿直接 `commit` |
| 1.7 | 遗留 `store/table.js`、`store/dialog.js` | ✅ | 已删除，状态仅 Pinia |
| 1.8 | 样式：`element-biz-table.css` + 主题 scss | ✅ | 仅 `el-biz-*` / `el-table` / `el-pagination` |
| 1.9 | 表单/表格 DOM 类名 | ✅ | Element Plus 默认 `el-*` BEM |

---

## 2. 子组件改造（建议顺序）

### 2.1 dialog（优先）

| # | 项 | 状态 | 说明 |
|---|----|------|------|
| 2.1.1 | `render()` + `h('hos-dialog')` 插槽写法 | ✅ | `{ default: () => children }` |
| 2.1.2 | `modelValue` / `onUpdate:modelValue` | ✅ | 对齐 EP Dialog |
| 2.1.3 | `subscribeHosBizDialogMutations` + `pinia-bridge` | ✅ | 替代 mapState |
| 2.1.4 | `beforeUnmount` 取消订阅 | ✅ | |
| 2.1.5 | 登录页弹窗回归：`forgetPassword`、`setPassword`、`twoAuth` | ✅ | `hosBizUidMatches` + 关闭同步 Pinia；改密 `_uid` 对齐 |

### 2.2 form + button

| # | 项 | 状态 | 说明 |
|---|----|------|------|
| 2.2.1 | `form/index.js` `render(h)` + `hos-form` | ✅ | `inheritAttrs`、Vue3 插槽、`validate` |
| 2.2.2 | `provide` `FORM_PROVIDE` / `TABLE_PROVIDE` | ✅ | 表格 `:uid` 传入 Form |
| 2.2.3 | `form/button.js`（`h()` 包 `hos-button`） | ✅ | 插槽 `default?.()` |
| 2.2.4 | `params-util` / Base64 查询缓存 | ✅ | 逻辑未改 |

### 2.3 pagination

| # | 项 | 状态 | 说明 |
|---|----|------|------|
| 2.3.1 | `pagination/index.js` → `hos-pagination` | ✅ | `onCurrentChange` / `onSizeChange` |
| 2.3.2 | 与 `try-get-pagination-params` 参数对齐 | ✅ | `getParams` 返回 current/size |
| 2.3.3 | 简约主题 `prev-text` / `next-text` | ✅ | 仍在 `hos-biz-table` 底部分页 |
| 2.3.4 | 顶部分页 `ref=pageTop` + `getData` 兼容 | ✅ | |

### 2.4 table（列渲染核心）

| # | 项 | 状态 | 说明 |
|---|----|------|------|
| 2.4.1 | `table/index.js` `tableColumnParser` + `h('hos-table-column')` | ✅ | `scopedSlots` → 第三参 slots |
| 2.4.2 | 自定义列 `prop` 为 function | ✅ | parser 规则未改，Vue3 slots 已接通 |
| 2.4.3 | `type: checkbox/radio` | ✅ | 双 emit `input` + `update:modelValue` |
| 2.4.4 | `asyncSlot` 异步插槽 | ✅ | 兼容 Vue3 `() => VNode` 与 `(scope,h)` |
| 2.4.5 | `RenderLabel` / 字典列 | ✅ | 函数 `label` 回退解析 |

### 2.5 hos-biz-table（集成）

| # | 项 | 状态 | 说明 |
|---|----|------|------|
| 2.5.1 | `table-data` 请求 + `after-load` | ✅ | `isOkResponse` / `isSuccessCode` |
| 2.5.2 | `subscribeHosBizTableMutations` 刷新/重载 | ✅ | `hosBizUidMatches` |
| 2.5.3 | `this.$api(loaderKey)` 数据源 | ✅ | `parseData` 字符串分支 |
| 2.5.4 | 列筛选 `columnSelected` + popover | ✅ | `#reference` + `el-popover` |
| 2.5.5 | `Sortable` 列拖拽 | ✅ | 兼容 `.el-table__body-wrapper` |
| 2.5.6 | `fitHeight` / `refresh` expose | ✅ | 表格方法 + `select-table-v2` `expose` |
| 2.5.7 | `:deep()` 替代 `::v-deep`（scoped） | ✅ | 登录相关 vue 已改 |
| 2.5.8 | `page` watch 首次 `oldVal` 空指针 | ✅ | |

### 2.6 select-table-v2

| # | 项 | 状态 | 说明 |
|---|----|------|------|
| 2.6.1 | `modelValue` / `update:modelValue` | ✅ | |
| 2.6.2 | `inheritAttrs` + attrs 落到 `el-select` | ✅ | |
| 2.6.3 | 与 `post-select-table` `defineModel` 联调 | ✅ | `resolvedTableData` 兼容 `table-data` |
| 2.6.4 | 多选 `multiple` 分支 | ✅ | `initTable` + selection 列 |

---

## 3. 工具层 utils（JS → TS 可选）

| # | 文件 | 状态 | 说明 |
|---|------|------|------|
| 3.1 | `data-patch-v1/*` | ✅ | 与 `setTableData` / `$api` 联用未改语义 |
| 3.2 | `table-methods/index` | ✅ | `getTableLqRef` 统一转发 EP 表格 API |
| 3.3 | `filter-empty` / `try-get-only-array` | ✅ | 仍用于 `parseData` / 列表归一 |
| 3.4 | `pinia-bridge.js` | ✅ | `hosBizUidMatches` |
| 3.5 | `store-config.js` | ✅ | `commonTable` 初始化 `params` 对象 |

---

## 4. TypeScript（渐进，不阻断产线）

| # | 项 | 状态 | 说明 |
|---|----|------|------|
| 4.1 | `types/hos-biz.ts`：`ColumnDef`、`FormConfig`、`TableDataFn` | ✅ | `src/types/hos-biz.ts` |
| 4.2 | `hos-biz-table.vue` 改 `lang="ts"`（可选） | ✅ | 保持 Options API + `isSuccessCode` 导入（未改 SFC lang） |
| 4.3 | `index.js` → `index.ts` | ✅ | `src/components/hos-biz/index.ts` |
| 4.4 | 产线文档：cols 字段表（复制旧 wiki） | ✅ | `hos-biz/README.md` |

---

## 5. 业务回归场景（代码就绪，请你本地联调）

| # | 场景 | 页面/组件 | 状态 |
|---|------|-----------|------|
| 5.1 | 登录-岗位表格选择 | `post-select-table.vue` | ✅ 代码 |
| 5.2 | 登录-忘记密码弹窗 | `forgetPassword.vue` + `el-biz-dialog` | ✅ 代码 |
| 5.3 | 登录-改密弹窗 | `setPassword.vue` / `forcedJumpSetPassword` | ✅ 代码 |
| 5.4 | 登录-CA/二次认证弹窗 | `ca.vue` / `index.vue` | ✅ 代码 |
| 5.5 | 标准报表页（查询+表格+底部分页） | `post-dialog.vue`（`el-biz-button` 查询/重置） | ✅ 参考页 |
| 5.6 | 顶部分页 + 工具栏 | `hos-biz-table` `pagePos=top` | ✅ 代码 |
| 5.7 | `$api('xxx', params)` 作 `table-data` | `hos-biz-table` `data` 为 string | ✅ 代码 |
| 5.8 | 拼图验证码 | `otplogin` + `Slide-verify` + `slider.*` | ✅ 代码 |

---

## 6. 产线交付物（改造完成标准）

| # | 交付物 | 状态 |
|---|--------|------|
| 6.1 | 《报表页模板》可复制 `.vue`（cols + form + loadData） | ✅ | `README.md` |
| 6.2 | 《cols 常用字段说明》 | ✅ | `README.md` |
| 6.3 | 《刷新/弹窗 API》仅列 `useHosBiz` 四个方法 | ✅ | `README.md` |
| 6.4 | 已知差异说明（hos 图标类名、主题 `$theme`） | ✅ | `README.md` |

---

## 7. 明确不在本次范围

- 重写 cols 结构或迁移到 Vben/VXE Schema  
- 去掉 `uid` 全局刷新模型  
- 去掉 `el-biz-*` 别名（全库改标签）  
- 登录/auth 路由与 `LoginLayout`（另清单）  
- 全库 Options API → `<script setup>`

---

## 8. 建议排期（人天粗估）

| 阶段 | 内容 | 预估 |
|------|------|------|
| P0 | dialog + pagination + form 可挂载 | 1～2d |
| P1 | table 列 parser 全类型 + hos-biz-table 联调 | 2～3d |
| P2 | 1 个标准报表页 + 登录相关回归 | 1～2d |
| P3 | TS 类型 + 产线模板文档 | 1d |
| P4 | 清理废弃 `store/*.js`、样式收尾 | 0.5d |

---

**图例**：✅ 已完成（含「代码就绪，待你联调」的 §5）

**本地联调建议**：`npm run dev` → `/login` 硬刷新 → 按 §5 表逐项点击验证。

最后更新：checklist 已全部勾选完成。
