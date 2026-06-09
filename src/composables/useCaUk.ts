import { reactive, ref, type Ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { fetchCAInitParams } from '@/api/ca'
import { loadCaVendorExports } from '@/utils/load-ca-vendor'
import { crypt } from '@/composables/useCrypt'

export interface CaLoginInfo {
	loginType?: string
	venderCode?: string
	jsPath?: string
	type?: string
	[key: string]: unknown
}

export interface UkSelectOption {
	label: string
	value: string
}

export interface CaUkFunction {
	GetUserList?: () => string
	Login?: (ctx: Record<string, unknown>, container: string, password: string) => number | boolean
	SignedData?: (serverRan: string, container: string) => string
	GetSignCert?: (container: string) => string
	GetCertNo?: (container: string) => string
	GetUniqueID?: (cert: string, container: string) => string
	[key: string]: unknown
}

export function useCaUk(options: {
	info: Ref<CaLoginInfo>
	againLogin: Ref<boolean>
	postChainId: Ref<string>
	login: (upData: Record<string, unknown>) => void
}) {
	const { t } = useI18n()
	const { info, againLogin, postChainId, login } = options

	const ukSelectArray = ref<UkSelectOption[]>([])
	const ukFunction = ref<CaUkFunction>({})
	const ukForm = reactive({
		strContainerName: '',
		ukeyPassword: '',
		post: '',
	})
	const ukDefaultForm = ref<Record<string, unknown>>({})

	const ukRules = reactive<FormRules>({
		ukeyPassword: [{ required: true, trigger: 'blur', message: t('请输入密码') }],
		strContainerName: [{ required: true, trigger: 'blur', message: t('请选择UKEY') }],
	})

	function requireUKJS() {
		const item = info.value
		if (item.loginType !== 'UKEY' || !item.jsPath) {
			return Promise.resolve()
		}
		return loadCaVendorExports(String(item.jsPath)).then((mod) => {
			ukFunction.value = mod as CaUkFunction
		})
	}

	function analysis() {
		ukSelectArray.value = []
		const fn = ukFunction.value
		if (!fn.GetUserList) return

		const selectStr = fn.GetUserList()
		const temp = selectStr.split('&&&')

		for (let i = 0; i < temp.length; i++) {
			const item = temp[i]
			if (!item) continue
			const s = item.split('||')
			ukSelectArray.value.push({
				label: s[0] ?? '',
				value: s[1] ?? '',
			})
		}

		if (ukSelectArray.value.length > 0) {
			ukForm.strContainerName = ukSelectArray.value[0]?.value || ''
		}
	}

	function getCAautograph() {
		const fn = ukFunction.value
		const autographObj: Record<string, string> = {
			strClientSignedData: fn.SignedData!(
				String(ukDefaultForm.value.strServerRan),
				ukForm.strContainerName,
			),
			cert: fn.GetSignCert!(ukForm.strContainerName),
			certNo: fn.GetCertNo!(ukForm.strContainerName),
		}
		autographObj.userCertCode = fn.GetUniqueID!(
			autographObj.cert ?? '',
			ukForm.strContainerName,
		)
		return autographObj
	}

	function getCAInitParams() {
		const upData = {
			venderCode: info.value.venderCode,
			loginType: info.value.loginType,
		}
		fetchCAInitParams(upData).then((res) => {
			if (res && res.code == '200') {
				ukDefaultForm.value = (res.data as Record<string, unknown>) || {}
			}
		})
	}

	function ukLogin(formRef: FormInstance | undefined) {
		formRef?.validate((valid) => {
			if (!valid) return

			;(window as Window & { strServerRan?: string }).strServerRan = String(
				ukDefaultForm.value.strServerRan ?? '',
			)
			const fn = ukFunction.value
			const loginState = fn.Login!({}, ukForm.strContainerName, ukForm.ukeyPassword)

			if (loginState || loginState === 1) {
				const autographObj = getCAautograph()
				const upData = Object.assign(
					{
						grantType: 'ca',
						accountCode: '',
						loginType: info.value.loginType,
						venderCode: info.value.venderCode,
						caUkeyPin: crypt(ukForm.ukeyPassword),
						certContainer: ukForm.strContainerName,
					},
					ukDefaultForm.value,
					autographObj,
				)

				if (postChainId.value) {
					upData.postChainId = postChainId.value
					upData.post = ukForm.post
				}
				login(upData)
			}
		})
	}

	function changePost(_id: string | number, post: string) {
		ukForm.post = post
	}

	function initUkLogin() {
		if (info.value.loginType === 'UKEY' && againLogin.value !== true) {
			requireUKJS()
				.then(() => {
					analysis()
					getCAInitParams()
				})
				.catch((err) => {
					console.error('[CA UKEY] vendor script load failed:', err)
				})
		}
	}

	function reloadUkOnActiveTypeChange(newVal: string, oldVal: string | undefined) {
		if (
			newVal != oldVal &&
			newVal === info.value.type &&
			info.value.loginType === 'UKEY'
		) {
			requireUKJS()
				.then(() => {
					analysis()
					getCAInitParams()
				})
				.catch((err) => {
					console.error('[CA UKEY] vendor script load failed:', err)
				})
		}
	}

	return {
		ukSelectArray,
		ukFunction,
		ukForm,
		ukDefaultForm,
		ukRules,
		requireUKJS,
		analysis,
		getCAautograph,
		getCAInitParams,
		ukLogin,
		changePost,
		initUkLogin,
		reloadUkOnActiveTypeChange,
	}
}
