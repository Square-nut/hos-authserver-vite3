export default class RenderLabel {
	i = 0;
	value: unknown;

	getLabel(value: unknown): string {
		this.value = value;
		return typeof this.value === 'string'
			? this.value
			: '自定义列' + ++this.i;
	}
}
