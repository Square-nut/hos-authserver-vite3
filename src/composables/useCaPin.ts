import { reactive, ref, type Ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { Base64 } from 'js-base64'
import { fetchAuthPinPhone } from '@/api/ca'
import type { CaLoginInfo } from '@/composables/useCaUk'

export function useCaPin(options: {
	info: Ref<CaLoginInfo>
	login: (upData: Record<string, unknown>) => void
}) {
	const { t } = useI18n()
	const { info, login } = options

	const pinForm = reactive({
		accountCode: '',
		passwordPin: '',
	})

	const pinRules = reactive<FormRules>({
		accountCode: [{ required: true, trigger: 'blur', message: t('请输入用户名') }],
		passwordPin: [{ required: true, trigger: 'blur', message: t('请输入PIN码') }],
	})

	const pinPhoneToken = ref('')

	function authPinPhone() {
		const upData = {
			venderCode: info.value.venderCode,
			loginType: info.value.loginType,
			accountCode: pinForm.accountCode,
			passwordPin: Base64.encode(pinForm.passwordPin),
		}
		fetchAuthPinPhone(upData).then((res) => {
			if (res && res.code == '200') {
				pinPhoneToken.value = (res.data as { phoneToken?: string })?.phoneToken ?? ''

				login({
					grantType: 'ca',
					caPhoneToken: pinPhoneToken.value,
					venderCode: info.value.venderCode,
					loginType: info.value.loginType,
				})
			}
		})
	}

	function pinLogin(formRef: FormInstance | undefined) {
		formRef?.validate((valid) => {
			if (valid) {
				authPinPhone()
			}
		})
	}

	return {
		pinForm,
		pinRules,
		pinPhoneToken,
		pinLogin,
		authPinPhone,
	}
}
