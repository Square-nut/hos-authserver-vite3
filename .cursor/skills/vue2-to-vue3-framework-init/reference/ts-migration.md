# `src/` JS → TS 迁移参考

> v3 标杆：`hos-authserver-web-v3` 的 `src/` 已无 `.js`（`public/ca/*.js` 与 `public/environment.js` 除外）。

## 不迁移

| 路径 | 原因 |
|------|------|
| `public/ca/*.js` | CA 厂商 UKey/手机脚本，运行时动态加载 |
| `public/environment.js` | 部署时注入的 `__hos` 运行时配置 |

## 推荐顺序

| 批次 | 范围 | 要点 |
|------|------|------|
| 1 | `permission.js` → `permission.ts` | `NavigationGuard`、`RouteLocationNormalized` 类型 |
| 2 | `constant/common-constant.js` | `as const` 导出 |
| 3 | `utils/**/*.js` | 分批：base → crypt → mac-util → websys → index |
| 4 | `i18n/langs/*.js` | `LocaleMessageTree` 递归类型 |
| 5 | `views/login/js/*.js`、`views/exception/type.js` | 小模块优先 |
| 6 | `components/hos-biz/**/*.js` | `defineComponent` + `h()` + `PropType` |

## Vue3 TS 写法

### 普通模块

```ts
// 环境变量
const base = import.meta.env.VITE_APP_BASE_URL || '/api'

// 导出函数加参数/返回类型
export function fetchXxx(params?: Record<string, unknown>): Promise<ApiResult<unknown>> {
  return httpGet('/path', params)
}
```

### hos-biz render 组件

```ts
import { defineComponent, h, type PropType, type VNode } from 'vue'

export default defineComponent({
  name: 'HosBizTableCore',
  props: {
    cols: { type: Array as PropType<TableColConfig[]>, required: true },
  },
  setup(props, { slots, emit }) {
    return () => h(ElTable, { data: rows.value }, () => slots.default?.())
  },
})
```

### permission 路由守卫

```ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

router.beforeEach(async (to, _from, next: NavigationGuardNext) => {
  // ...
})
```

## 清理项

迁移完成后删除：

- 与 `.ts` 重复的 `.d.ts` 垫片（如 `crypt/index.d.ts`、`hos-biz/**/index.d.ts`）
- `is-open-db.js` 等仅做 re-export 的垫片
- `websys.addins copy.js` 等冗余副本
- `shims-js.d.ts` 中已迁模块的 `declare module`（仅留第三方库）

## import 规范

- **禁止** `.js` 后缀：`import x from '@/utils/foo.js'` → `import x from '@/utils/foo'`
- Vite/TS 自动解析 `.ts`

## 复杂文件策略

| 文件 | 策略 |
|------|------|
| `utils/index.ts`（700+ 行） | 可先 `@ts-nocheck`，后续逐步加类型 |
| `mac-util.ts`、websys addins | 可先 `@ts-nocheck` |
| `validateUtil.ts` | 逐步补参数类型 |

`@ts-nocheck` 不阻断 `vue-tsc`（文件级跳过），但新代码应避免。

## 验收

```bash
find src -name '*.js' | wc -l          # 0
rg "from ['\"].*\.js['\"]" src         # 无 import .js
npm run type-check
npm run build
```

## 第三方类型

`src/shims-js.d.ts` 或 `src/utils/utils-modules.d.ts`：

- `qs`、`qrcode`（或 `@types/qrcode`、`@types/qs`）
- `js-cookie`、`clipboard`、`crypto-js`、`encryptlong`、`sm-crypto`、`xss`
