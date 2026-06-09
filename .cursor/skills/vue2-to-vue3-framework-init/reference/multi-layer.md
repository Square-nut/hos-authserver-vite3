# 多层结构参考（multi-layer）

> **本文件服务基建 Skill**。子产品 / 业务 views 不在此范围，见 [`docs/vue3-migration/`](../../../../docs/vue3-migration/README.md)。

---

## 1. 基建 vs 非基建

```
src/
├── main.js, App.vue, moduleConfig.js, dynamic-loader.js   ← 基建 Shell
├── load-api.js, load-layout.js, load-views.js            ← 基建（gen）
├── biz/                          → 非基建（业务扩展）
└── sys/
    ├── hos-app-base/             → @base
    │   ├── api, axios, router, store, components, utils, …  ← 基建
    │   ├── permission.js, version.js, …                     ← 基建
    │   └── views/                                           ← 非基建
    ├── low-code/                 → 非基建（main 最小挂载即可）
    └── origin-data/              → 非基建
```

---

## 2. 典型 alias

| Alias | 路径 |
|-------|------|
| `@` | `src/biz` |
| `@base` | `src/sys/hos-app-base` |
| `@core` | `src/sys` |
| `@src` | `src/` |

---

## 3. dynamic-loader（基建核心）

`bin/gen-loader-files.js` + `dynamic-loader.js` 须保留，能解析 **未改造** 的各模块 `views/**/*.vue`。

基建验收：任选一个未改业务菜单能打开。

---

## 4. 与单层的差异

| 项 | 单层 | 多层基建 |
|----|------|----------|
| API | 删 loader | 保留 loader + @base 新 fetchXxx |
| 动态视图 | glob + resolve | dynamicLoadViews/Layout |
| TS 范围 | src 非 views | Shell + @base 非 views |
| 子产品 | — | main 挂载即可，内部交业务组 |

---

## 5. Phase 1：Vite alias

```ts
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src/biz', import.meta.url)),
    '@base': fileURLToPath(new URL('./src/sys/hos-app-base', import.meta.url)),
    '@core': fileURLToPath(new URL('./src/sys', import.meta.url)),
    '@src': fileURLToPath(new URL('./src', import.meta.url)),
  },
},
```

`predev` / `prebuild`：`npm run gen`

---

## 6. Phase 2：入口（最小集成）

```ts
// 基建：从 @base 拉核心
import router from '@base/router'
import store from '@base/store'
// …

// 最小集成：能启动即可，不改子产品源码
import widgetComponents from '@core/low-code/views/widget/components'
app.use(widgetComponents)

import bizMainUtils from '@/bizMain'
bizMainUtils(app)
```

`App.vue` 上与 **基建相关的** mixin 拆 composable；子产品页面内的 mixin 由业务组处理。

---

## 7. Phase 4：API 双轨

- **基建新代码**：`@base/api/*.ts` → `httpGet`/`httpPost`
- **存量 / 业务页**：`$api('module.path')` → dynamic-loader（业务组可暂留）

勿删 `@base/axios/loader.js`。

---

## 8. Phase 6：路由

`@base/utils/router` 中 `dynamicLoadViews` / `dynamicLoadLayout` 覆盖 moduleConfig 注册的模块；**不要求** views 文件已 Vue3 化。

---

## 9. 基建完成标准（multi-layer）

- [ ] Shell + @base 非 views：Vue3 + TS + 无 Vuex/mixins（框架层）
- [ ] dynamic-loader 正常
- [ ] 未改业务页可访问
- [ ] `docs/vue3-migration/` 已交付业务组
