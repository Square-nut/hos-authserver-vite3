declare module '@/utils/theme/themeConfig' {
	const themeConfig: Record<string, Record<string, string>>
	export default themeConfig
}

declare module 'qs' {
	const qs: {
		parse(str: string, options?: Record<string, unknown>): Record<string, string>
		stringify(obj: Record<string, unknown>, options?: Record<string, unknown>): string
	}
	export default qs
}

declare module 'qrcode' {
	export function toDataURL(
		text: string,
		options?: Record<string, unknown>,
	): Promise<string>
	export function toCanvas(
		canvas: HTMLCanvasElement,
		text: string,
		options?: Record<string, unknown>,
		callback?: (error: Error | null) => void,
	): void
}

declare interface Window {
	strServerRan?: string
}
