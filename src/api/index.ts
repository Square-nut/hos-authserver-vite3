/**
 * API 模块统一导出（Vue3 标准：按域拆分 *.ts）
 *
 * @see ./login.ts
 * @see ./i18n.ts
 * @see ./oauth.ts
 * @see ./org.ts
 * @see ./sys.ts
 * @see ./auth.ts
 * @see ./ca.ts
 * @see ./forget-password.ts
 * @see ./scan-code.ts
 * @see ./sys-password.ts
 * @see ./tenant.ts
 * @see ./tree.ts
 * @see ./websys.ts
 * @see ./staff.ts
 * @see ./ssoVisit.ts
 */

export * from './login'
export * from './i18n'
export * from './oauth'
export * from './org'
export * from './sys'
export * from './auth'
export * from './ca'
export * from './forget-password'
export * from './scan-code'
export * from './sys-password'
export * from './tenant'
export * from './tree'
export * from './websys'
export * from './staff'
export * from './ssoVisit'

export { loginApi } from './login'
export { i18nApi } from './i18n'
export { oauthApi } from './oauth'
export { orgApi } from './org'
export { sysApi } from './sys'
export { authApi } from './auth'
export { caApi } from './ca'
export { forgetPasswordApi } from './forget-password'
export { scanCodeApi } from './scan-code'
export { sysPasswordApi } from './sys-password'
export { tenantApi } from './tenant'
export { treeApi } from './tree'
export { websysApi } from './websys'
export { staffApi } from './staff'
export { ssoVisitApi } from './ssoVisit'
