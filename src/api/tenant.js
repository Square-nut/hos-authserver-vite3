// 根据域名获取租户  select-tenant-by-domain
export function getTenant(params) {
  return {
    url: '/rest/login/auth/select-tenant-by-domain',
    method: 'get',
    params: params
  }
}