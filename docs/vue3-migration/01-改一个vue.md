# 01 — 改一个 .vue 业务页

一次只改当前文件。在文件内搜索左侧写法，替换为右侧。

## 1. 脚本：常用替换

| 搜索（Vue2） | 替换为（Vue3） |
|--------------|----------------|
| `this.$t('key')` | `const { t } = useI18n()`，模板用 `t('key')` |
| `this.$route` | `const route = useRoute()` |
| `this.$router.push(...)` | `const router = useRouter(); router.push(...)` |
| `this.$message.error(msg)` | `ElMessage.error(msg)`（Element Plus；HosUI 用对应 API） |
| `this.$store.dispatch('X', p)` | `useXxxStore().X(p)`（问基建组 store 名） |
| `this.$store.commit('X', p)` | Pinia store 的 action / 直接改 state |
| `mapState(...)` / `mapGetters(...)` | `storeToRefs(useXxxStore())` 或 computed |
| `this.$crypt(x)` | `const { crypt } = useCrypt(); crypt(x)` |
| `this.$ls.get(k)` | `lsGet(k)` 或 Pinia |
| `this.$refs.form.validate(cb)` | `formRef.value?.validate(cb)` |
| `this.$emit('ok', data)` | `const emit = defineEmits(['ok']); emit('ok', data)` |
| `beforeDestroy` / `destroyed` | `onBeforeUnmount` / `onUnmounted` |

### script setup 头部模板（复制后按项删减）

```vue
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
// import { ElMessage } from 'element-plus'
// import { useUserStore } from '@/stores/user'
// import { useCrypt } from '@/composables/useCrypt'
</script>
```

多层项目 import 路径用 [04-多层alias速查.md](./04-多层alias速查.md)。

## 2. 模板：常用替换

| Vue2 | Vue3 |
|------|------|
| `slot="footer"` | `#footer` |
| `slot-scope="scope"` | `#default="scope"` |
| `::v-deep .class` | `:deep(.class)` |
| `:visible.sync="show"` | `v-model:visible="show"` |
| `.sync` 其他 prop | `v-model:propName` |

## 3. mixins

若页面用了 CA / 登录等 mixin：

- 删除 `mixins: [...]`
- 在 setup 里调用 `useCaUk()` / `useCaPin()` 等（路径问基建组）

**可以暂不改成 script setup**：Options API 在 Vue3 仍能运行；先修 `$store` / `$api` 等报错即可。

## 4. 改完自测

- [ ] 菜单能打开
- [ ] 控制台无红错
- [ ] 列表 / 表单 / 保存 / 弹窗点一遍
