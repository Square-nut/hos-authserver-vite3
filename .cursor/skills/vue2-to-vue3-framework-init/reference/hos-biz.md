# hos-biz Vue3 改造参考

> **原则**：对外用法不变（`cols` + `form` + `table-data` + `page` + `uid`），只做运行时与类型升级。  
> **范围**：`src/components/hos-biz/` + `stores/hosBiz*.ts` + `composables/useHosBiz.ts`  
> **不做**：换 Vben schema、改 cols 字段语义、去掉 uid 模型、全库改 `el-biz-*` 标签

---

## 0. 对外契约（必须保持一致）

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
| 刷新表格 | `refreshHosBizTable({ _uid })` |
| 打开弹窗 | `openHosBizDialog({ _uid, component, props })` |
| 关闭弹窗 | `closeHosBizDialog({ _uid })` |
| 注册名 | `el-biz-table` / `el-biz-dialog` / `el-biz-button` / `el-biz-select-table-2` |

---

## 1. 基础设施

| 项 | 说明 |
|----|------|
| `main.ts` 注册 `HosBiz` | `app.use(HosBiz)` |
| Element Plus | `element-plus-resolve.ts` 解析组件 |
| Pinia | `hosBizTable` / `hosBizDialog` 替代 Vuex |
| `useHosBiz.ts` | 业务勿直接 commit store |
| 底层实现 | 全部 `.ts`（`defineComponent` + `h()` render） |
| 删除 Vuex | 原 `store/table.js`、`store/dialog.js` |
| 样式 | `element-biz-table.css` + 主题 scss |
| 主题判断 | `UI_THEME` 常量，非 `$theme` globalProperties |

---

## 2. 子组件改造顺序

### 2.1 dialog（优先）

- `render()` + `h('hos-dialog')` 插槽：`{ default: () => children }`
- `modelValue` / `onUpdate:modelValue`
- `subscribeHosBizDialogMutations` + `pinia-bridge`
- `onBeforeUnmount` 取消订阅
- `hosBizUidMatches(storeUid, instanceUid)` 匹配 `_uid`

### 2.2 form + button

- `form/index.js`：`inheritAttrs`、Vue3 插槽、`validate` 暴露
- `provide` `FORM_PROVIDE` / `TABLE_PROVIDE`
- `form/button.js`：插槽 `default?.()`

### 2.3 pagination

- `onCurrentChange` / `onSizeChange`
- 与 `try-get-pagination-params` 对齐 current/size
- 简约主题 prev/next text 在 hos-biz-table 底部分页

### 2.4 table（列渲染核心）

- `tableColumnParser` + `h('hos-table-column')`
- `scopedSlots` → Vue3 第三参 slots
- checkbox/radio：双 emit `input` + `update:modelValue`
- `asyncSlot`：兼容 `() => VNode` 与 `(scope, h)`
- `RenderLabel` 字典列

### 2.5 hos-biz-table（集成）

- `table-data` 请求 + `@after-load`：`isSuccessCode`
- `subscribeHosBizTableMutations` 刷新/重载
- `table-data` 为函数：`(params) => fetchXxx(params)`
- 列筛选 popover：`#reference`
- Sortable：`.el-table__body-wrapper`
- `defineExpose`：fitHeight / refresh
- `:deep()` 替代 `::v-deep`
- `page` watch 注意首次 `oldVal` 空值

### 2.6 select-table-v2

- `modelValue` / `update:modelValue`
- `inheritAttrs` 落到 `el-select`
- 多选 `multiple` + selection 列

---

## 3. 工具层

| 文件 | 用途 |
|------|------|
| `data-patch-v1/*` | setTableData / 列表归一 |
| `table-methods/index` | 转发 EP 表格 API |
| `filter-empty` | parseData 参数过滤 |
| `pinia-bridge.ts` | store 订阅 + uid 匹配 |
| `store-config.ts` | `commonTable` 初始化 params 对象 |

v3 标杆：hos-biz 目录内已无 `.js` / 旁挂 `.d.ts`，类型内联于 `.ts`。

---

## 4. TypeScript

| 项 | 说明 |
|----|------|
| `types/hos-biz.ts` | ColumnDef、FormConfig、TableDataFn |
| `hos-biz-table.vue` | script setup + isSuccessCode |
| `index.ts` | 插件注册入口 |
| `hos-biz/README.md` | cols 字段表、产线模板 |

---

## 5. 建议排期

| 阶段 | 内容 | 预估 |
|------|------|------|
| P0 | dialog + pagination + form 可挂载 | 1～2d |
| P1 | table 列 parser + hos-biz-table 联调 | 2～3d |
| P2 | 1 个标准页 + layout 挂载验证 | 1d |
| P3 | TS 类型 + README | 1d |
| P4 | 清理 Vuex store、样式收尾 | 0.5d |

---

## 6. 产线交付物

- 《报表页模板》可复制 `.vue`（cols + form + loadData）
- 《cols 常用字段说明》
- 《刷新/弹窗 API》四个 useHosBiz 方法
- 已知差异（EP 类名、`UI_THEME` 替代 `$theme`）

详见 `src/components/hos-biz/README.md`。

---

## 7. 框架层回归点（不含 views 业务逻辑）

- layout 能挂载 `el-biz-dialog` / `el-biz-table`
- `refreshHosBizTable({ _uid })` 触发对应表格 reload
- `table-data` 传函数引用 `fetchXxx`，不支持字符串 key
- 顶部分页 `pagePos=top` + toolbar 渲染正常

业务页用法与回归见 [`docs/vue3-migration/03-hos-biz用法.md`](../../../../docs/vue3-migration/03-hos-biz用法.md)。
