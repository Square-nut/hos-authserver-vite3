import type { VNode } from 'vue';

type LabelRenderer = (scope: Record<string, unknown>, h: () => null) => string | VNode | unknown;

export default class RenderLabel {
	i = 0;
	value?: unknown;

	getLabel(value: unknown): string {
		this.value = value;
		if (typeof value === 'string') return value;
		if (typeof value === 'function') {
			try {
				const rendered = (value as LabelRenderer)({}, () => null);
				if (typeof rendered === 'string') return rendered;
			} catch {
				/* 列头函数可能依赖完整 scope，回退默认文案 */
			}
		}
		return '自定义列' + ++this.i;
	}
}
