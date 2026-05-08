export const $config = {
  baseURL: 'http://114.242.246.250:8104/',//192.168.1.103:8004
}

/**
 * 手写分页查询员工列表
 *selectPage
 */
export const selectPageStaff = (param) =>{
  return {
    url: '/staff/selectPageStaff',
    method: 'get',
    params: param
  }
}

/**
 * 根据实体属性条件分页查询
 *
 */
export const selectPage = (param) =>{
  return {
    url: '/staff/selectPage',
    method: 'get',
    params: param
  }
}

/**
 * 保存实体
 */
export const insert = (param) => {
  return {
    url: '/staff/insert',
    method: 'post',
    data: param
  }
}

/**
 * 根据id获取数据
 */
export const selectById = (id) => {
  return {
    url: '/staff/selectById',
    method: 'get',
    params: {
      id: id
    }
  }
}

/**
 * 更新数据
 */
export const updateById = (param) => {
  return {
    url: '/staff/updateById',
    method: 'post',
    data: param
  }
}

/**
 * 删除数据
 */
export const deleteById = (id) => {
  return {
    url: '/staff/deleteStaffById',
    method: 'post',
    needSign: true,
    needCrypt: true,
    needDecrypt: true,
    params: {
      id: id
    }
  }
}

/**
 * 接口配置示例
 * @param name 用户名称
 */
export const api4 = (param) => {
  const { name, phone, email } = param
  return {
    url:  `/staff/selectPageStaff/`+name ,
    //动态url,接口需要加签名需要加此参数
    pathVariable:{
      name: name
    },
    method: 'post',
    params: {
      phone: phone
    },
    data: {
      email: email,
      current:1,
      size:10
    },
    // needSign: true,
    //  needCrypt: true,
    //  needDecrypt: true,
  }
}
