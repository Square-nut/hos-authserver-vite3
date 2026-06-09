import * as storageUtil from '@/utils/base/storage-util'
import UserConstant from '@/constant/user-constant'

export function getTenantId(): unknown {
	return storageUtil.getLocal(UserConstant.tenantId)
}

export function setTenantId(tenantId: unknown): unknown {
	return storageUtil.setLocal(UserConstant.tenantId, tenantId)
}

export function removeTenantId(): unknown {
	return storageUtil.removeLocal(UserConstant.tenantId)
}

export function getRoleId(): unknown {
	return storageUtil.getLocal(UserConstant.roleId)
}

export function setRoleId(roleId: unknown): unknown {
	return storageUtil.setLocal(UserConstant.roleId, roleId)
}

export function removeRoleId(): unknown {
	return storageUtil.removeLocal(UserConstant.roleId)
}

export function getOrgId(): unknown {
	return storageUtil.getLocal(UserConstant.orgId)
}

export function setOrgId(orgId: unknown): unknown {
	return storageUtil.setLocal(UserConstant.orgId, orgId)
}

export function removeOrgId(): unknown {
	return storageUtil.removeLocal(UserConstant.orgId)
}

export function getUserInfo(): unknown {
	return storageUtil.getLocal(UserConstant.userInfo)
}

export function setUserInfo(userInfo: unknown): unknown {
	return storageUtil.setLocal(UserConstant.userInfo, userInfo)
}

export function removeUserInfo(): unknown {
	return storageUtil.removeLocal(UserConstant.userInfo)
}

export function getLoginName(): unknown {
	return storageUtil.getLocal(UserConstant.loginName)
}

export function setLoginName(loginName: unknown): unknown {
	return storageUtil.setLocal(UserConstant.loginName, loginName)
}

export function removeLoginName(): unknown {
	return storageUtil.removeLocal(UserConstant.loginName)
}

export function getName(): unknown {
	return storageUtil.getLocal(UserConstant.name)
}

export function setName(name: unknown): unknown {
	return storageUtil.setLocal(UserConstant.name, name)
}

export function removeName(): unknown {
	return storageUtil.removeLocal(UserConstant.name)
}

export function getAvatar(): unknown {
	return storageUtil.getLocal(UserConstant.avatar)
}

export function setAvatar(avatar: unknown): unknown {
	return storageUtil.setLocal(UserConstant.avatar, avatar)
}

export function removeAvatar(): unknown {
	return storageUtil.removeLocal(UserConstant.avatar)
}

export function getPolicyErrorCode(): unknown {
	return storageUtil.getLocal(UserConstant.policyErrorCode)
}

export function setPolicyErrorCode(policyErrorCode: unknown): unknown {
	return storageUtil.setLocal(UserConstant.policyErrorCode, policyErrorCode)
}

export function removePolicyErrorCode(): unknown {
	return storageUtil.removeLocal(UserConstant.policyErrorCode)
}

export function removeAllUserStore(): void {
	removeRoleId()
	removeOrgId()
	removeUserInfo()
	removeLoginName()
	removeName()
	removeAvatar()
	removePolicyErrorCode()
}
