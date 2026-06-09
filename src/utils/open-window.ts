/**
 * Created by PanJiaChen on 16/11/29.
 */
export default function openWindow(
	url: string,
	title: string,
	w: number,
	h: number,
): Window | null {
	const dualScreenLeft =
		window.screenLeft !== undefined ? window.screenLeft : (screen as Screen & { left?: number }).left ?? 0
	const dualScreenTop =
		window.screenTop !== undefined ? window.screenTop : (screen as Screen & { top?: number }).top ?? 0

	const width = window.innerWidth
		? window.innerWidth
		: document.documentElement.clientWidth
			? document.documentElement.clientWidth
			: screen.width
	const height = window.innerHeight
		? window.innerHeight
		: document.documentElement.clientHeight
			? document.documentElement.clientHeight
			: screen.height

	const left = width / 2 - w / 2 + dualScreenLeft
	const top = height / 2 - h / 2 + dualScreenTop
	const newWindow = window.open(
		url,
		title,
		'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width=' +
			w +
			', height=' +
			h +
			', top=' +
			top +
			', left=' +
			left,
	)

	if (newWindow) {
		newWindow.focus()
	}
	return newWindow
}
