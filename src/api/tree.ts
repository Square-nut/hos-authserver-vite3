/**
 * 树形数据
 */
import { httpGet } from '@/axios'

export function fetchTreeNode(param?: Record<string, unknown>) {
	return httpGet<unknown>('/getTreeNode', param)
}

export function fetchTreeSearch(param?: Record<string, unknown>) {
	return httpGet<unknown>('/getTreeSeach', param)
}

/** --- loader（与旧版 tree.js 一致）--- */
export function getTreeNode(param?: Record<string, unknown>) {
	return { url: '/getTreeNode', method: 'get', params: param }
}

export function getTreeSeach(param?: Record<string, unknown>) {
	return { url: '/getTreeSeach', method: 'get', params: param }
}

export const treeApi = {
	fetchTreeNode,
	fetchTreeSearch,
}
