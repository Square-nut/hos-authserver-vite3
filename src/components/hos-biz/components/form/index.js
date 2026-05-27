/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 10:59:15
 */
import { h } from 'vue'
import Params, { addRule } from '../../utils/params-util'
import { Base64 } from 'js-base64'
import { isFunction, isArray, isObject } from '../../utils/get-type'
import trySyncData from '../../utils/data-patch-v1/try-sync-data'
import { ElForm } from '../../utils/element-plus-resolve'

export const COMPONENT_NAME = 'F'

addRule(COMPONENT_NAME, {
	parse(params) {
		return JSON.parse(Base64.decode(params))
	},
	componentization(params) {
		return Base64.encode(JSON.stringify(params))
	},
})

const props = {
	uid: {
		default: 0,
	},
}

function pickFormAttrs(attrs) {
	const reserved = ['onSearch', 'onReset', 'onSubmit', 'onsearch', 'onreset', 'onsubmit']
	const formAttrs = { ...attrs }
	reserved.forEach((key) => {
		delete formAttrs[key]
	})
	return formAttrs
}

export default {
	name: 'HosBizForm',
	inheritAttrs: false,
	render() {
		return h(
			ElForm,
			{
				ref: 'form',
				...pickFormAttrs(this.$attrs),
				onSubmit: (e) => {
					e.preventDefault()
				},
			},
			this.$slots.default?.(),
		)
	},
	props,
	provide() {
		return {
			FORM_PROVIDE: this,
		}
	},
	inject: {
		TABLE_PROVIDE: {
			default: null,
		},
	},
	data() {
		return {
			params: new Params(COMPONENT_NAME, this),
			initialData: {},
		}
	},
	methods: {
		filterTempParams(params, isDelTempParams) {
			params = JSON.parse(JSON.stringify(params))
			if (isDelTempParams) {
				Object.keys(params).forEach((v) => {
					if (v.indexOf('TEMP_ARRAY') === 0) {
						delete params[v]
					}
				})
			}
			return params
		},
		async getParams(isDeleteTempParams = true) {
			const formRef = this.$refs.form
			if (!formRef || !this.$attrs.model) {
				return Promise.reject(new Error('el-biz-form: missing form ref or model'))
			}
			try {
				await formRef.validate()
			} catch {
				return Promise.reject(this.filterTempParams(this.$attrs.model, isDeleteTempParams))
			}
			const params = this.filterTempParams(this.$attrs.model, isDeleteTempParams)
			return params
		},
		submit() {
			return this.getParams().then((res) => {
				if (isFunction(this.$attrs.onSubmit)) {
					return this.$attrs.onSubmit(res)
				}
			})
		},
		search() {
			return this.getParams(false).then((res) => {
				return this.params.set(res).then(() => {
					if (isFunction(this.$attrs.onSearch)) {
						const params = this.filterTempParams(res, true)
						return this.$attrs.onSearch(params)
					}
				})
			})
		},
		reset() {
			this.params.clear()
			this.$refs.form?.resetFields?.()
			const model = this.$attrs.model
			if (model) {
				Object.keys(model).forEach(
					(prop) => (model[prop] = this.initialData[prop]),
				)
			}
			this.$emit('reset', model)
		},
		clear() {
			this.params.clear()
			this.$refs.form?.resetFields?.()
			const model = this.$attrs.model
			if (!model) return
			Object.keys(model).forEach((prop) => {
				if (isObject(model[prop])) {
					model[prop] = {}
				} else if (isArray(model[prop])) {
					model[prop] = []
				} else {
					model[prop] = ''
				}
			})
			this.$emit('reset', model)
		},
	},
	created() {
		const model = this.$attrs.model
		if (!model) return
		const query = this.params.get()
		Object.keys(model).forEach((prop) => {
			this.initialData[prop] = model[prop]
			if (
				query &&
				query[prop] !== undefined &&
				model[prop] !== query[prop]
			) {
				model[prop] = query[prop]
			}
		})
		trySyncData(this, '$attrs.model')
	},
}
