/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 10:58:52
 * @Last Modified time: 2026-05-09
 */
import Params, { addRule } from '../../utils/params-util';
import { defineComponent, h, resolveComponent } from 'vue';

export const COMPONENT_NAME = 'P';

const uidProp = {
	uid: {
		type: [Number, String],
		default: 0,
	},
};

addRule(COMPONENT_NAME, {
	parse(params: string) {
		const parts = params.split('.');
		return {
			current: +parts[0]!,
			size: +parts[1]!,
		};
	},
	componentization(params: unknown) {
		const p = params as Record<string, number>;
		return Object.keys(p)
			.map((v) => p[v])
			.join('.');
	},
});

export default defineComponent({
	name: 'HosBizPagination',
	props: uidProp,
	data() {
		return {
			timer: null as ReturnType<typeof setTimeout> | null,
			params: new Params(COMPONENT_NAME, this),
		};
	},
	methods: {
		getParams() {
			const current =
				this.params.get('current') ||
				(this.$attrs.currentPage as number | undefined) ||
				1;
			const size =
				this.params.get('size') ||
				(this.$attrs.pageSize as number | undefined) ||
				10;
			return Promise.resolve({ current, size });
		},
	},
	render() {
		const LPagination = resolveComponent('l-pagination');
		const attrs = this.$attrs as Record<string, unknown>;
		const props: Record<string, unknown> = { ...attrs };
		props.layout =
			(props.layout as string) ||
			'sizes, prev, pager, next, jumper, ->, total';
		props.current =
			this.params.get('current') ||
			(props.currentPage as number) ||
			1;
		props.size =
			this.params.get('size') || (props.pageSize as number) || 10;

		const defaultSlot = this.$slots.default;

		return h(
			LPagination,
			{
				...props,
				onCurrentChange: (val: number) => {
					const query = {
						current: val,
						size: props.pageSize as number,
					};
					this.params.set(query).then(() => {
						this.$emit('current-change', val);
					});
				},
				onSizeChange: (val: number) => {
					const query = {
						current: props.currentPage as number,
						size: val,
					};
					this.params.set(query).then(() => {
						this.$emit('size-change', val);
					});
				},
			},
			defaultSlot ? { default: defaultSlot } : undefined,
		);
	},
});
