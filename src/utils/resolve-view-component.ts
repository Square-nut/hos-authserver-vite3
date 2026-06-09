const viewModules = import.meta.glob('@/views/**/*.vue', { eager: true })
const iframeModules = import.meta.glob('@/components/layouts/IframePageView.vue', {
	eager: true,
})

const iframeComponent =
	(Object.values(iframeModules)[0] as { default?: unknown })?.default ?? null

/**
 * Vite 下动态加载 views 组件
 */
export function resolveViewComponent(
	componentPath: string,
	isFrame = false,
): unknown {
	if (isFrame) {
		return iframeComponent
	}
	if (!componentPath) {
		return null
	}
	let path = String(componentPath).replace(/^\//, '')
	if (!path.endsWith('.vue')) {
		path += '.vue'
	}
	const match = Object.entries(viewModules).find(
		([filePath]) => filePath.endsWith(`/${path}`) || filePath.endsWith(path),
	)
	return match ? (match[1] as { default: unknown }).default : null
}
