import type { PropType } from 'vue';
import { defineComponent, h } from 'vue';
import { ElButton } from 'element-plus';
import { isPromise, isFunction } from '../../utils/get-type';

/**
 * form.submit / form.reset / form.search 链式执行
 */
type RunCommandCtx = Record<string, unknown> & {
	loading: boolean;
	run?: string | string[];
};

function runCommand(this: RunCommandCtx, commands: string[]): void | Promise<void> {
	if (commands.length === 0) return;
	const command = commands.shift()!.split('.');
	const provideKey = `${command[0]!.toLocaleUpperCase()}_PROVIDE`;
	const provide = this[provideKey] as Record<string, () => unknown> | undefined;

	if (provide && command[1] && isFunction(provide[command[1]])) {
		const result = provide[command[1]]!();
		if (isPromise(result)) {
			this.loading = true;
			return (result as Promise<unknown>)
				.then(() => {
					this.loading = false;
					return runCommand.call(this, commands);
				})
				.finally(() => {
					this.loading = false;
				});
		} else {
			return runCommand.call(this, commands);
		}
	}
}

export default defineComponent({
	name: 'ElBizButton',
	props: {
		run: {
			type: [String, Array] as PropType<string | string[] | undefined>,
			default: undefined,
		},
	},
	inject: {
		FORM_PROVIDE: { default: null },
	},
	data() {
		return {
			loading: false,
		};
	},
	render() {
		const defaultSlot = this.$slots.default;
		return h(ElButton, {
			...this.$attrs,
			loading: this.loading,
			onClick: (val: unknown) => {
				if (this.run) {
					runCommand.call(
						this as unknown as RunCommandCtx,
						Array.isArray(this.run) ? [...this.run] : [this.run],
					);
				}
				const clickHandler = this.$attrs.onClick;
				if (isFunction(clickHandler)) {
					const result = clickHandler(val);
					if (isPromise(result)) {
						this.loading = true;
						(result as Promise<unknown>).finally(() => {
							this.loading = false;
						});
					}
				}
			},
		}, defaultSlot ? { default: defaultSlot } : undefined);
	},
});
