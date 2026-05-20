/**
 * 用户相关 localStorage 键名常量
 */
const UserConstant = {
	tenantId: 'tenant-id',
	orgId: 'org-id',
	roleId: 'role-id',
	postId: 'post-id',
	postName: 'post-name',
	userInfo: 'user-info',
	loginName: 'login-name',
	avatar: 'avatar',
	name: 'name',
	policyErrorCode: 'policy-error-code',
	baseScopeResource: 'base-scope-resource',
	AccountName: 'account-name',
	HomePage: 'home-page',
	IP: 'IP',
	HostName: 'HostName',
	Mac: 'MAC',
} as const

export type UserConstantKey = keyof typeof UserConstant
export type UserConstantMap = typeof UserConstant

export default UserConstant
