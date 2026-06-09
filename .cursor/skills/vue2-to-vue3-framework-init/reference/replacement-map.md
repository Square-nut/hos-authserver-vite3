# 旧写法 → 新写法对照表

**基建组**改 layout、stores、hos-biz 内部时使用。  
**业务组**改单个 `.vue` / api 时请用 [`docs/vue3-migration/`](../../../../docs/vue3-migration/README.md)（小上下文友好），不必通读本文。

> **Profile**：单层基建删除 loader；多层基建保留 dynamic-loader，业务页存量 `$api` 可暂留。见 [multi-layer.md](multi-layer.md)。

## 全局能力

| Vue2 | Vue3 |
|------|------|
| `this.$api('key', params)` | `import { fetchXxx } from '@/api/...'`（单层：**无** loader；多层存量可经 `dynamicLoadApi`） |
| `apiRequest('module.method')` | 删除；改为 `fetchXxx` |
| `useApi()` | 删除；不再存在 |
| `utils/*.js` | `utils/*.ts`，import 不带 `.js` 后缀 |
| `permission.js` | `permission.ts` |
| hos-biz `*.js` render | `*.ts` + `defineComponent` + `h()` |
| `this.$message.error(msg)` | `import { ElMessage } from 'element-plus'` |
| `this.$crypt(data)` | `useCrypt().crypt(data)` 或 `import { crypt } from '@/composables/useCrypt'` |
| `this.$ls.get/set` | `import { lsGet, lsSet } from '@/utils/ls'` 或 Pinia |
| `this.$theme` / `$theme == 1` | `UI_THEME` from `@/constants/ui-theme` |
| `this.$t('key')` | `const { t } = useI18n()` |
| `this.$route` / `this.$router` | `useRoute()` / `useRouter()` |
| `this.$store.dispatch('Login')` | `useUserStore().Login()` |
| `this.$refs.form.validate(cb)` | `formRef.value?.validate(cb)` |
| `this.$emit('event', arg)` | `defineEmits<{ event: [arg: T] }>()` |

## 入口与插件

| Vue2 | Vue3 |
|------|------|
| `Vue.use(Plugin)` | `app.use(Plugin)` |
| `Vue.prototype.$xxx = ...` | composable 或显式 import（禁止 globalProperties） |
| `new Vue({ store, router, render })` | `createApp(App).use(pinia).use(router).mount('#app')` |
| mixins: `[uk, pin]` | `useCaUk()` / `useCaPin()` |

## 模板

| Vue2 | Vue3 |
|------|------|
| `slot="footer"` | `#footer` |
| `::v-deep .foo` | `:deep(.foo)` |
| `.sync` | `v-model:propName` |
| `@hook:mounted` | 子组件 `defineExpose` + ref 调用 |
| `destroyed` / `beforeDestroy` | `onUnmounted` / `onBeforeUnmount` |

## 构建与环境

| Vue2 | Vue3 |
|------|------|
| `process.env.VUE_APP_*` | `import.meta.env.VITE_*` |
| `require('@/views/xxx')` | `import.meta.glob` + `resolveViewComponent` |
| `webpack require.context` | `import.meta.glob('./views/**/*.vue')` |

## hos-biz

| Vue2 | Vue3 |
|------|------|
| `this.$store.commit('OPEN_DIALOG', payload)` | `openHosBizDialog(payload)` |
| `mapState('table', [...])` | `subscribeHosBizTableMutations` + Pinia bridge |
| `value` + `input`（Dialog） | `modelValue` + `update:modelValue` |
| `scopedSlots: { default: ... }` | 第三参 `{ default: () => ... }` |
| `refreshTable({ _uid })` via Vuex | `refreshHosBizTable({ _uid })` |
| `table-data="'module.method'"` | `:table-data="(params) => fetchXxx(params)"` |

## API 响应

```ts
// 推荐模式
const { code, data, msg } = await fetchXxx(...)
if (isSuccessCode(code)) {
  const payload = (data ?? {}) as Record<string, unknown>
  // 使用 payload.xxx
}
```

## i18n

| Vue2 | Vue3 |
|------|------|
| `legacy: true` + `this.$t` | `legacy: false` + `useI18n()` |
| `i18n.t` in JS | `i18n.global.t` |
| 动态 merge | `i18n.global.mergeLocaleMessage(locale, messages)` |

## 类型

| 场景 | 做法 |
|------|------|
| 无类型 `.js` 模块 | 同目录 `.d.ts` 或 `shims-js.d.ts` |
| `ApiResult<unknown>` 赋值窄类型 | `as unknown as TargetType` |
| localStorage 值 | 始终当 `string`，`=== '0'` 而非 `== 0` |
