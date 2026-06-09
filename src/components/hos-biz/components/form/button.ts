import { h, defineComponent, type PropType, type VNode, type Component } from 'vue';
import { ElButton } from '../../utils/element-plus-resolve';
import { isPromise, isFunction } from '../../utils/get-type';

type FormProvide = Record<string, (...args: unknown[]) => unknown>;

type ButtonInstance = {
	loading: boolean;
	run?: string | string[];
	$attrs: Record<string, unknown>;
	$slots: { default?: () => VNode[] };
	FORM_PROVIDE: FormProvide | null;
};

function runCommand(this: ButtonInstance, commands: string[]): void | Promise<void> | undefined {
	if (commands.length === 0) return;
	const command = commands.shift()!.split('.');
	const provide = this[(command[0]!.toLocaleUpperCase() + '_PROVIDE') as 'FORM_PROVIDE'];

	if (provide && isFunction(provide[command[1]!])) {
		const result = provide[command[1]!]!();
		if (isPromise(result)) {
			this.loading = true;
			return result
				.then(() => {
					this.loading = false;
					return runCommand.call(this, commands);
				})
				.finally(() => {
					this.loading = false;
				});
		}
		return runCommand.call(this, commands);
	}
}

const HosBizButton = defineComponent({
	name: 'HosBizButton',
	data() {
		return {
			loading: false,
		};
	},
	props: {
		run: {
			type: [String, Array] as PropType<string | string[]>,
		},
	},
	inject: {
		FORM_PROVIDE: {
			default: null,
		},
	},
	render() {
		const attrs = { ...this.$attrs };
		attrs.loading = this.loading;

		return h(
			ElButton,
			{
				...attrs,
				onClick: (val: MouseEvent) => {
					if (this.run) {
						runCommand.call(
							this as unknown as ButtonInstance,
							Array.isArray(this.run) ? [...this.run] : [this.run],
						);
					}
					const clickHandler = this.$attrs.onClick;
					if (isFunction(clickHandler)) {
						const result = clickHandler(val);
						if (isPromise(result)) {
							this.loading = true;
							result.finally(() => {
								this.loading = false;
							});
						}
					}
				},
			},
			this.$slots.default?.(),
		);
	},
});

export default HosBizButton as Component;
