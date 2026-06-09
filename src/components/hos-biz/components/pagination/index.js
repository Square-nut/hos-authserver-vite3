/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 10:58:52
 */
import { h } from 'vue';
import { ElPagination } from '../../utils/element-plus-resolve';
import Params, { addRule } from '../../utils/params-util';

export const COMPONENT_NAME = 'P';

const props = {
	uid: {
		default: 0,
	},
};

addRule(COMPONENT_NAME, {
	parse(params) {
		params = params.split('.');
		return {
			current: +params[0],
			size: +params[1],
		};
	},
	componentization(params) {
		return Object.keys(params)
			.map((v) => params[v])
			.join('.');
	},
});

export default {
	name: 'HosBizPagination',
	data() {
		return {
			timer: null,
			params: new Params(COMPONENT_NAME, this),
		};
	},
	props,
	render() {
		const layout =
			this.$attrs.layout || 'sizes, prev, pager, next, jumper, ->, total';
		const current =
			this.params.get('current') || this.$attrs.currentPage || 1;
		const pageSize = this.params.get('size') || this.$attrs.pageSize || 10;

		return h(
			ElPagination,
			{
				...this.$attrs,
				layout,
				currentPage: current,
				pageSize,
				onCurrentChange: (val) => {
					const query = {
						current: val,
						size: pageSize,
					};
					this.params.set(query).then(() => {
						this.$emit('current-change', val);
					});
				},
				onSizeChange: (val) => {
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
		getParams() {
			const current = this.params.get('current') || this.$attrs.currentPage || 1;
			const size = this.params.get('size') || this.$attrs.pageSize || 10;
			return Promise.resolve({ current, size });
		},
	},
};
