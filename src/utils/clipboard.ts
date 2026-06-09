import Clipboard from 'clipboard'
import { ElMessage } from 'element-plus'

function clipboardSuccess(): void {
	ElMessage({
		message: 'Copy successfully',
		type: 'success',
		duration: 1500,
	})
}

function clipboardError(): void {
	ElMessage({
		message: 'Copy failed',
		type: 'error',
	})
}

export default function handleClipboard(text: string, event: MouseEvent): void {
	const clipboard = new Clipboard(event.target as Element, {
		text: () => text,
	})
	clipboard.on('success', () => {
		clipboardSuccess()
		clipboard.destroy()
	})
	clipboard.on('error', () => {
		clipboardError()
		clipboard.destroy()
	})
	clipboard.onClick(event)
}
