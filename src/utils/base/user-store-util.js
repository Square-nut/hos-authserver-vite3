import * as storageUtil from '@/utils/base/storage-util';
import UserConstant from '@/constant/user-constant';
/**
 * 租户id
 */
export function getTenantId() {
	return storageUtil.getLocal(UserConstant.tenantId);
}

export function setTenantId(tenantId) {
	return storageUtil.setLocal(UserConstant.tenantId, tenantId);
}

export function removeTenantId() {
	return storageUtil.removeLocal(UserConstant.tenantId);
}
///角色id
export function getRoleId() {
	return storageUtil.getLocal(UserConstant.roleId);
}

export function setRoleId(roleId) {
	return storageUtil.setLocal(UserConstant.roleId, roleId);
}

export function removeRoleId() {
	return storageUtil.removeLocal(UserConstant.roleId);
}
////科室id
export function getOrgId() {
	return storageUtil.getLocal(UserConstant.orgId);
}

export function setOrgId(orgId) {
	return storageUtil.setLocal(UserConstant.orgId, orgId);
}

export function removeOrgId() {
	return storageUtil.removeLocal(UserConstant.orgId);
}
////用户信息
export function getUserInfo() {
	return storageUtil.getLocal(UserConstant.userInfo);
}

export function setUserInfo(userInfo) {
	return storageUtil.setLocal(UserConstant.userInfo, userInfo);
}

export function removeUserInfo() {
	return storageUtil.removeLocal(UserConstant.userInfo);
}

////登录名
export function getLoginName() {
	return storageUtil.getLocal(UserConstant.loginName);
}

export function setLoginName(loginName) {
	return storageUtil.setLocal(UserConstant.loginName, loginName);
}

export function removeLoginName() {
	return storageUtil.removeLocal(UserConstant.loginName);
}

///用户姓名
export function getName() {
	return storageUtil.getLocal(UserConstant.name);
}

export function setName(name) {
	return storageUtil.setLocal(UserConstant.name, name);
}

export function removeName() {
	return storageUtil.removeLocal(UserConstant.name);
}

////用户头像
export function getAvatar() {
	return storageUtil.getLocal(UserConstant.avatar);
}

export function setAvatar(avatar) {
	return storageUtil.setLocal(UserConstant.avatar, avatar);
}

export function removeAvatar() {
	return storageUtil.removeLocal(UserConstant.avatar);
}

////密码策略错误数据
export function getPolicyErrorCode() {
	return storageUtil.getLocal(UserConstant.policyErrorCode);
}

export function setPolicyErrorCode(policyErrorCode) {
	return storageUtil.setLocal(UserConstant.policyErrorCode, policyErrorCode);
}

export function removePolicyErrorCode() {
	return storageUtil.removeLocal(UserConstant.policyErrorCode);
}
export function removeAllUserStore() {
	removeRoleId();
	removeOrgId();
	removeUserInfo();
	removeLoginName();
	removeName();
	removeAvatar();
	removePolicyErrorCode();
}
