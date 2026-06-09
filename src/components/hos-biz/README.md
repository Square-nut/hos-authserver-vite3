# hos-biz（Vue3 + Element Plus）

配置化报表/选择表格组件，**对外用法与 Vue2 版一致**。状态由 Pinia（`hosBizTable` / `hosBizDialog`）驱动，勿再使用已删除的 `store/table.js`、`store/dialog.js`。

## 注册名

| 模板标签 | 说明 |
|----------|------|
| `el-biz-table` | 标准报表表格 |
| `el-biz-dialog` | 全局弹窗容器（需先放模板 + `openHosBizDialog`） |
| `el-biz-button` | 表单内按钮 |
| `el-biz-select-table-2` | 下拉内嵌表格（岗位选择等） |

## 报表页模板

```vue
<template>
  <el-biz-table
    :uid="'report-demo'"
    :cols="cols"
    :form="form"
    :table-data="loadData"
    :page="pageConfig"
    @after-load="onAfterLoad"
  >
    <template #form>
      <el-form-item :label="t('名称')">
        <el-input v-model="form.model.name" clearable />
      </el-form-item>
    </template>
    <template #toolbar>
      <el-biz-button type="primary" @click="onAdd">{{ t('新增') }}</el-biz-button>
    </template>
  </el-biz-table>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { refreshHosBizTable } from '@/composables/useHosBiz'
import type { ColumnDef, FormConfig, PageConfig, TableDataFn } from '@/types/hos-biz'
import { fetchYourList } from '@/api/your-module'

const { t } = useI18n()
const TABLE_UID = 'report-demo'

const form = reactive<FormConfig>({
  labelWidth: 'auto',
  model: { name: '' },
})

const pageConfig: PageConfig = { pageSize: 20 }

const cols = computed<ColumnDef[]>(() => [
  { label: t('名称'), prop: 'name' },
  { label: t('编码'), prop: 'code' },
])

const loadData: TableDataFn = (params) => fetchYourList(params)

function onAfterLoad() {
  /* 可选：首屏后逻辑 */
}

function onAdd() {
  /* ... */
  refreshHosBizTable({ _uid: TABLE_UID })
}
</script>
```

`table-data` **必须是函数**（返回 `Promise<ApiResult>`），不支持 loader 字符串 key。

## cols 常用字段

| 字段 | 说明 |
|------|------|
| `label` | 列标题；可为函数自定义表头 |
| `prop` | 字段名；可为函数自定义单元格 |
| `width` / `minWidth` | 列宽 |
| `fixed` | `left` / `right` |
| `sortable` | 排序 |
| `type: 'checkbox'` | 多选列（需 `key` 行唯一字段，默认 `id`） |
| `type: 'radio'` | 单选列 |
| `slotName` | 对应 `asyncSlot` 中的异步插槽名 |
| `render` | `(scope, h) => vnode` 单元格渲染 |
| `children` | 多级表头 |

## 刷新与弹窗 API

从 `@/composables/useHosBiz` 引入（或 `useHosBiz()` 解构）：

| 方法 | 用途 |
|------|------|
| `refreshHosBizTable({ _uid })` | 保留查询条件刷新 |
| `reloadHosBizTable({ _uid })` | 重载（等同 UPDATE + 刷新） |
| `updateHosBizTable({ _uid })` | 触发表格更新事件 |
| `openHosBizDialog({ _uid, component, props })` | 打开弹窗 |
| `closeHosBizDialog({ _uid })` | 关闭并销毁内容 |

弹窗须先在页面放置占位：

```vue
<el-biz-dialog title="标题" uid="myDialog" width="600px" />
```

```ts
openHosBizDialog({ _uid: 'myDialog', component: MyPanel, props: { id: 1 } })
```

## 已知差异（Vue2 → Vue3）

- hos-biz 内部 `render()` 直接使用 Element Plus 组件（`ElTable`、`ElDialog` 等），不再注册 `hos-*` 别名。
- 全局 `$theme`：`0` / `1` / `2` 影响表格工具栏样式（见 `main.ts`）。
- 旧 `el-icon-*` 类名需逐步改为 `@element-plus/icons-vue`。
- 响应 `code` 建议用 `isSuccessCode()`（`200` 与 `'200'`）。

详细改造进度见 [VUE3-MIGRATION-CHECKLIST.md](./VUE3-MIGRATION-CHECKLIST.md)（**已全部完成，请你按 §5 联调**）。

## 本地联调清单（§5）

1. **账号登录** → 定岗表格（`wrought`）→ 选岗后再次登录  
2. **忘记密码** → 打开/完成/关闭弹窗  
3. **错误码触发强制改密** → `forcedJumpSetPassword` 弹窗保存后 loading 解除  
4. **二次认证**（短信 / CA）弹窗  
5. **短信登录** → 获取验证码前先完成拼图滑块（`Slide-verify`）  
6. **扫码登录岗位弹窗** → `post-dialog.vue`（标准 `el-biz-table` + 查询/重置按钮）

参考实现：`src/views/login/post-dialog.vue`（报表形态：`cols` + `form` + `:data` 函数 + `el-biz-button run="form.search"`）。
