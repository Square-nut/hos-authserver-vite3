import { h } from 'vue';
import { ElButton } from '../../utils/element-plus-resolve';
import { isPromise, isFunction } from '../../utils/get-type';

function runCommand(commands) {
	if (commands.length === 0) return;
	const command = commands.shift().split('.');
	const provide = this[command[0].toLocaleUpperCase() + `_PROVIDE`];

	if (provide && isFunction(provide[command[1]])) {
		const result = provide[command[1]]();
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

export default {
	name: 'HosBizButton',
	data() {
		return {
			loading: false,
		};
	},
	props: {
		run: {
			type: [String, Array],
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
				onClick: (val) => {
					if (this.run) {
						runCommand.call(
							this,
							Array.isArray(this.run) ? this.run : [this.run],
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
};
