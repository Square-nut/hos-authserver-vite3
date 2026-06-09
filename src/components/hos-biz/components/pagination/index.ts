/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 10:58:52
 */
import { h, defineComponent, type Component, type ComponentPublicInstance } from 'vue';
import { ElPagination } from '../../utils/element-plus-resolve';
import Params, { addRule } from '../../utils/params-util';

export const COMPONENT_NAME = 'P';

const props = {
	uid: {
		type: [String, Number],
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
	componentization(params: Record<string, unknown>) {
		return Object.keys(params)
			.map((v) => params[v])
			.join('.');
	},
});

type PaginationInstance = ComponentPublicInstance & {
	uid: string | number;
	$attrs: Record<string, unknown> & {
		layout?: string;
		currentPage?: number;
		pageSize?: number;
	};
	$emit: (event: 'current-change' | 'size-change', val: number) => void;
	params: Params;
	timer: ReturnType<typeof setTimeout> | null;
	getParams: () => Promise<{ current: number; size: number }>;
};

const HosBizPagination = defineComponent({
	name: 'HosBizPagination',
	data(this: PaginationInstance) {
		return {
			timer: null as ReturnType<typeof setTimeout> | null,
			params: new Params(COMPONENT_NAME, this),
		};
	},
	props,
	render(this: PaginationInstance) {
		const layout = this.$attrs.layout || 'sizes, prev, pager, next, jumper, ->, total';
		const current = this.params.get('current') || this.$attrs.currentPage || 1;
		const pageSize = this.params.get('size') || this.$attrs.pageSize || 10;

		return h(
			ElPagination,
			{
				...this.$attrs,
				layout,
				currentPage: current as number,
				pageSize: pageSize as number,
				onCurrentChange: (val: number) => {
					const query = {
						current: val,
						size: pageSize,
					};
					this.params.set(query).then(() => {
						this.$emit('current-change', val);
					});
				},
				onSizeChange: (val: number) => {
					const query = {
						current,
						size: val,
					};
					this.params.set(query).then(() => {
						this.$emit('size-change', val);
					});
				},
			},
			{
				default: () => this.$slots.default?.(),
			},
		);
	},
	methods: {
		getParams(this: PaginationInstance) {
			const current = this.params.get('current') || this.$attrs.currentPage || 1;
			const size = this.params.get('size') || this.$attrs.pageSize || 10;
			return Promise.resolve({ current: current as number, size: size as number });
		},
	},
});

export default HosBizPagination as Component;
