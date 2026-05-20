/**
 * 组织 / 岗位相关接口
 */
import { httpGet } from '@/axios'

export interface PostPageRecord {
	id: string
	name: string
	activity?: boolean
	[key: string]: unknown
}

export interface PostPageResult {
	records?: PostPageRecord[]
	[key: string]: unknown
}

/** 定岗分页列表（原 selectPostPage） */
export function fetchSelectPostPage(params?: Record<string, unknown>) {
	return httpGet<PostPageResult>('/org/hos-post/select-post-page', params)
}

export const orgApi = {
	fetchSelectPostPage,
}
