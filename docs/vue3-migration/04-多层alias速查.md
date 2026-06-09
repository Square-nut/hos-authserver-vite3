# 04 — 多层 alias 速查

仅 **multi-layer** 项目需要。改业务文件时先确认文件在哪个目录。

## 目录 → import 前缀

| 你的文件在 | 常用 alias | 示例 import |
|------------|------------|-------------|
| `src/biz/` | `@/` | `import x from '@/utils/foo'` |
| `src/sys/hos-app-base/views/` | `@base` | `import x from '@base/utils/util'` |
| `src/sys/low-code/` | `@core/low-code` | `import x from '@core/low-code/utils/foo'` |
| `src/sys/origin-data/` | `@core/origin-data` | `import x from '@core/origin-data/views/...'` |
| Shell / moduleConfig | `@src` | `import moduleConfig from '@src/moduleConfig'` |

## 基建 vs 业务

| 类型 | 路径 |
|------|------|
| **基建（别动）** | `src/main.js`、`dynamic-loader.js`、`hos-app-base/` 除 `views/` |
| **业务（你们改）** | `hos-app-base/views/`、`low-code/`、`origin-data/`、`biz/` |

## API 路径习惯

| 场景 | 做法 |
|------|------|
| 新接口 | `import { fetchXxx } from '@base/api/...'` 或本模块 `api/` |
| 存量 `$api('biz.foo.bar')` | 可暂留，见 [02-改一个api.md](./02-改一个api.md) |
| 跨模块 key | 不要改 key 字符串；基建的 loader 靠它解析 |

## 不要动

- `moduleConfig.js`
- `load-api.js` / `load-layout.js` / `load-views.js`（改 views 后如需更新映射，跑 `npm run gen`，不要手改生成文件）

## 改完自测

- [ ] import 无「模块找不到」报错
- [ ] 菜单对应页面能打开（dynamic-loader 仍能加载你的 `.vue`）
