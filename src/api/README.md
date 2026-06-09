# api 目录说明（标准 Vue3）

接口按业务域拆分为 **`*.ts`**，`url` 与具名函数同文件，使用 `httpGet` / `httpPost` / `http`。

统一导出见 **`index.ts`**（仅 re-export）。

AI / Cursor 约定：`.cursor/rules/api-http-conventions.mdc`；迁移流程：`.cursor/skills/migrate-api-to-ts/SKILL.md`。

---

## 模块一览

| 文件 | 说明 |
|------|------|
| `login.ts` | `/security/*` 登录、验证码、许可等 |
| `i18n.ts` | `/i18n/*` 国际化 |
| `oauth.ts` | OAuth、社交登录、授权码 |
| `org.ts` | 岗位 `selectPostPage` |
| `sys.ts` | 系统菜单、配置、列权限等 |
| `auth.ts` | 登录前数据、OTP grantChainId |
| `ca.ts` | CA 二维码、UKey 初始化、PIN 登录 |
| `forget-password.ts` | 忘记密码短信校验与改密 |
| `scan-code.ts` | 手机扫码登录 |
| `sys-password.ts` | 密码策略与修改 |
| `tenant.ts` | 按域名查租户 |
| `tree.ts` | 树节点查询 |
| `websys.ts` | 本地 websys 客户端探测（独立 `baseURL`） |
| `staff.ts` | 员工 CRUD（独立 `baseURL`，遗留） |
| `ssoVisit.ts` | SSO 单点访问 |
| `slider.ts` | 拼图滑块验证码（jigsaw） |
| `index.ts` | 聚合导出各 `*Api` 对象 |

**`src/api` 下已无 `*.js` 文件。** 新接口只新增 `*.ts`，组件直接 `import { fetchXxx } from '@/api/...'`。

---

## 新增接口

```ts
// src/api/xxx.ts
import { httpGet } from '@/axios'

export function fetchSomething(params?: Record<string, unknown>) {
  return httpGet<YourType>('/your/path', params)
}
```

组件：

```ts
import { fetchSomething } from '@/api/xxx'

const res = await fetchSomething()
if (res.code != 200 || !res.data) return
```

---

## 历史 `$api` key → 新函数（对照表）

| 原 `$api` key | 新函数 | 模块 |
|---------------|--------|------|
| `ca.getQRData` | `fetchQRData` | `ca.ts` |
| `ca.getQRResultData` | `fetchQRResultData` | `ca.ts` |
| `ca.getCAInitParams` | `fetchCAInitParams` | `ca.ts` |
| `ca.authPinPhone` | `fetchAuthPinPhone` | `ca.ts` |
| `oauth.authorize` | `fetchOauthAuthorize` | `oauth.ts` |
| `oauth.checkToken` | `fetchCheckToken` | `oauth.ts` |
| `oauth.getAuthorizeCode` | `fetchAuthorizeCode` | `oauth.ts` |
| `forget-password.*` | `validateForgetCode` 等 | `forget-password.ts` |
| `scan-code.getPhoneScan` | `fetchPhoneScan` | `scan-code.ts` |
| `sys-password.ForcinggetPwdPolicy` | `fetchForcingPwdPolicy` | `sys-password.ts` |
| `websys.cmd` | `fetchWebsysCmd` | `websys.ts` |
| `slider.generateCaptcha` | `fetchGenerateCaptcha` | `slider.ts` |
| `getI18nConfig` | `fetchI18nLoginPageConfig` | `i18n.ts` |

更早迁移见各模块文件头注释；`/security/*` 见 `login.ts`。
