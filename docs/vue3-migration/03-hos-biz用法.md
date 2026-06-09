# 03 — hos-biz 用法（业务页只读本章）

hos-biz **内部实现由基建组维护**。业务页只需按下列写法使用，**不要改** `components/hos-biz/` 目录。

## 表格页模板

```vue
<el-biz-table
  :uid="'your-page-uid'"
  :cols="cols"
  :form="form"
  :table-data="loadData"
  :page="pageConfig"
  @after-load="onAfterLoad"
>
  <template #form>
    <!-- 查询表单项 -->
  </template>
  <template #toolbar>
    <!-- 工具栏按钮 -->
  </template>
</el-biz-table>
```

| 属性 | 说明 |
|------|------|
| `uid` | 页面唯一标识，刷新表格用 |
| `cols` | 列配置（保持原字段语义，勿换 schema） |
| `form` | 查询区配置 |
| `table-data` | **函数** `(params) => fetchXxx(params)`，见 [02-改一个api.md](./02-改一个api.md) |
| `page` | 分页配置 |

## 刷新表格

```ts
import { refreshHosBizTable } from '@/composables/useHosBiz'  // 路径按项目

refreshHosBizTable({ _uid: 'your-page-uid' })
```

## 打开 / 关闭弹窗

```ts
import { openHosBizDialog, closeHosBizDialog } from '@/composables/useHosBiz'

openHosBizDialog({
  _uid: 'your-page-uid',
  component: YourDialogComponent,
  props: { /* 传给弹窗 */ },
})

closeHosBizDialog({ _uid: 'your-page-uid' })
```

## 组件名（保持别名）

- `el-biz-table`
- `el-biz-dialog`
- `el-biz-button`
- `el-biz-select-table-2`

## 不要做的事

- 不要改 `cols` 字段含义去适配别的表格库
- 不要去掉 `uid`
- 不要直接 `commit` hos-biz 相关 store（用 `useHosBiz` 导出方法）

## 改完自测

- [ ] 表格能加载
- [ ] 查询 / 分页正常
- [ ] 弹窗能开能关
- [ ] 保存后刷新表格正常
