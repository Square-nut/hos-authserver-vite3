/**
 * 根据树节点id获取数据
 *
 */
export const getTreeNode = (param) => {
  return {
    url: '/getTreeNode',
    method: 'get',
    params: param
  }
}

/**
* 根据查询内容获取数据
*
*/
export const getTreeSeach = (param) => {
  return {
    url: '/getTreeSeach',
    method: 'get',
    params: param
  }
}