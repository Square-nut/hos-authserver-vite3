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

export const treeApi = {
	fetchTreeNode,
	fetchTreeSearch,
}
