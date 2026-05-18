/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 10:59:15
 * @Last Modified time: 2026-05-09
 */
import Params, { addRule } from '../../utils/params-util';
import { Base64 } from 'js-base64';
import { isFunction, isArray, isObject } from '../../utils/get-type';
import trySyncData from '../../utils/data-patch-v1/try-sync-data';
import { defineComponent, h } from 'vue';
import { ElForm } from 'element-plus';

export const COMPONENT_NAME = 'F';

addRule(COMPONENT_NAME, {
	parse(params: string) {
		return JSON.parse(Base64.decode(params));
	},
	componentization(params: unknown) {
		return Base64.encode(JSON.stringify(params));
	},
});

export default defineComponent({
	name: 'ElBizForm',
	props: {
		uid: {
			type: [Number, String],
			default(this: { TABLE_PROVIDE?: { uid?: number | string } }) {
				return this.TABLE_PROVIDE ? this.TABLE_PROVIDE.uid : 0;
			},
		},
	},
	provide() {
		return {
			FORM_PROVIDE: this,
		};
	},
	inject: {
		TABLE_PROVIDE: {
			default: null,
		},
	},
	data() {
		return {
			params: new Params(COMPONENT_NAME, this),
			initialData: {} as Record<string, unknown>,
		};
	},
	created() {
		const query = this.params.get() as Record<string, unknown> | null;
		const model = this.$attrs.model as Record<string, unknown>;
		Object.keys(model).forEach((prop) => {
			this.initialData[prop] = model[prop];
			if (
				query &&
				query[prop] !== undefined &&
				model[prop] !== query[prop]
			) {
				model[prop] = query[prop]!;
			}
		});
		trySyncData(this, '$attrs.model');
	},
	methods: {
		filterTempParams(
			params: Record<string, unknown>,
			isDelTempParams: boolean,
		) {
			const next = JSON.parse(JSON.stringify(params)) as Record<string, unknown>;
			if (isDelTempParams) {
				Object.keys(next).forEach((v) => {
					if (v.indexOf('TEMP_ARRAY') === 0) {
						delete next[v];
					}
				});
			}
			return next;
		},
		async getParams(isDeleteTempParams = true) {
			const form = this.$refs.form as { validate: () => Promise<boolean> };
			const valid = await form.validate();
			const model = this.$attrs.model as Record<string, unknown>;
			const params = this.filterTempParams(model, isDeleteTempParams);
			return valid ? Promise.resolve(params) : Promise.reject(params);
		},
		submit() {
			return this.getParams().then((res) => {
				const fn = this.$attrs.onSubmit as ((r: unknown) => unknown) | undefined;
				if (isFunction(fn)) {
					return fn(res);
				}
			});
		},
		search() {
			return this.getParams(false).then((res) => {
				return this.params.set(res).then(() => {
					const fn = this.$attrs.onSearch as ((r: unknown) => unknown) | undefined;
					if (isFunction(fn)) {
						const params = this.filterTempParams(res, true);
						return fn(params);
					}
				});
			});
		},
		reset() {
			this.params.clear();
			(this.$refs.form as { resetFields: () => void }).resetFields();
			const model = this.$attrs.model as Record<string, unknown>;
			Object.keys(model).forEach(
				(prop) => (model[prop] = this.initialData[prop]),
			);
			this.$emit('reset', model);
		},
		clear() {
			this.params.clear();
			(this.$refs.form as { resetFields: () => void }).resetFields();
			const model = this.$attrs.model as Record<string, unknown>;
			Object.keys(model).forEach((prop) => {
				if (isObject(model[prop])) {
					model[prop] = {};
				} else if (isArray(model[prop])) {
					model[prop] = [];
				} else {
					model[prop] = '';
				}
			});
			this.$emit('reset', model);
		},
	},
	render() {
		const defaultSlot = this.$slots.default;
		return h(
			ElForm,
			{
				ref: 'form',
				...this.$attrs,
				onSubmit: (e: Event) => {
					e.preventDefault();
				},
			},
			defaultSlot ? { default: defaultSlot } : undefined,
		);
	},
});
