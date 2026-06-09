<!-- 二次认证短信认证 -->
<template>
	<div class="oauth-otplogin">
		<div style="width: 100%; text-align: center">
			<div class="dialog-box">
				<div class="flex-box">
					<img
						class="ca-login-img"
						src="../../assets/images/ca/otp.png"
						alt=""
					/>
				</div>
				<div class="flex-box">
					<div class="login-type-title">{{ $t('短信验证登录') }}</div>
					<el-form
						ref="otpLoginFormRef"
						label-width=""
						hide-required-asterisk
						class="uk-dynamic"
						:model="otpForm"
						:rules="otpLoginRules"
					>
						<!-- 手机号 -->
						<el-form-item label="" prop="loginName">
							<el-input
								v-model="otpForm.loginName"
								class="input-width"
								disabled
							></el-input>
						</el-form-item>
						<!-- 验证码 -->
						<el-form-item label="" prop="">
							<div class="otp-box">
								<el-input
									v-model="otpForm.smsCode"
									ref="smsCode"
									type="text"
									class="input-width"
									@keyup.enter="keyEnterLogin"
								>
								</el-input>
								<span class="get-opt-code" @click="getCode()">{{
									!btnShow ? `${count}${$t('s后重新获取')}` : $t('获取验证码')
								}}</span>
							</div>
						</el-form-item>
						<!-- 操作按钮 -->
						<!-- <el-form-item label=""> -->
						<el-button
							type="primary"
							@click="otpLogin"
							class="input-width ca-login-button"
							>{{ $t('登录') }}</el-button
						>
						<!-- <el-button class="button-width " @click="close">{{$t('取消')}}</el-button> -->
						<!-- </el-form-item> -->
					</el-form>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import AuthConstant from '@/constant/auth-constant';
import { getLoginErrorDesc } from './js/login';
import { validPhone11, validEmail } from '@/utils/validateUtil';
import { useUserStore } from '@/stores/user';
import { closeHosBizDialog } from '@/composables/useHosBiz';
import { getOTPCode as fetchOTPCode } from '@/api/login';

const { t } = useI18n();

const props = withDefaults(
	defineProps<{
		loginSucessHandler?: () => void;
		againLogin?: boolean;
		grantChainId?: string;
		phoneDisplay?: string;
	}>(),
	{
		loginSucessHandler: () => {},
		againLogin: false,
		grantChainId: '',
		phoneDisplay: '',
	}
);

const emit = defineEmits<{
	(
		e: 'openTwoAuthDialog',
		grantChainId: string,
		authType: string,
		account: string
	): void;
}>();

const otpLoginFormRef = ref<FormInstance>();

const validatePhoneAndMail = (
	rule: unknown,
	value: string,
	callback: (error?: Error) => void
) => {
	let type = '';
	if (validPhone11(value)) {
		type = 'phone';
	}
	if (validEmail(value)) {
		type = 'mail';
	}
	if (type == '') {
		callback(new Error(t('请输入有效的手机号')));
	} else {
		callback();
	}
};

const otpForm = reactive({
	loginName: '',
	grantChainId: '',
	smsCode: '',
	smsId: '',
});

const otpLoginRules = reactive<FormRules>({
	loginName: [{ validator: validatePhoneAndMail, trigger: 'blur' }],
	smsCode: [
		{
			required: true,
			trigger: 'blur',
			message: t('验证码不能为空'),
		},
	],
});

const btnShow = ref(true);
const count = ref<number | string>('');
const timer = ref<ReturnType<typeof setInterval> | null>(null);

onMounted(() => {
	otpForm.loginName = props.phoneDisplay;
	otpForm.grantChainId = props.grantChainId;
});

function close() {
	closeHosBizDialog({ _uid: 'CADialog' });
}

function otpLogin() {
	const upData = {
		againLogin: props.againLogin,
		grantChainId: props.grantChainId,
		smsId: otpForm.smsId,
		smsCode: otpForm.smsCode,
		loginName: props.phoneDisplay,
		grantType: 'sms',
		loginType: 'phone',
	};
	useUserStore()
		.Login(upData)
		.then((res) => {
			if (res && res.code == 200) {
				props.loginSucessHandler?.();
			} else {
				ElMessage.error(res.msg);
				closeHosBizDialog({});
			}
		})
		.catch((err: { code?: string; msg?: string; data?: Record<string, unknown> }) => {
			const code = err.code;
			if (code === AuthConstant.twoAuthErrorCode) {
				const grantChainId = err.data?.grantChainId as string;
				const authType = err.data?.againAuthType as string;
				const account = err.data?.accountCode as string;
				emit('openTwoAuthDialog', grantChainId, authType, account);
			} else {
				let errorDesc = getLoginErrorDesc(String(code ?? ''), err.msg);
				if (!errorDesc || errorDesc == '') {
					errorDesc = t('短信登录失败，请重新再试！');
				}
				ElMessage.error(err.msg);
			}
		});
}

function keyEnterLogin() {
	otpLogin()
}

function getCode() {
	if (!btnShow.value) {
		return
	}
	otpLoginFormRef.value?.validateField('loginName', (valid) => {
		if (valid) {
			getOTPCode()
		}
	})
}

function countDown(timeLength: number) {
	const TIME_COUNT = timeLength;
	if (!timer.value) {
		count.value = TIME_COUNT;
		btnShow.value = false;
		timer.value = setInterval(() => {
			if (Number(count.value) > 0 && Number(count.value) <= TIME_COUNT) {
				count.value = Number(count.value) - 1;
			} else {
				btnShow.value = true;
				if (timer.value) {
					clearInterval(timer.value);
				}
				timer.value = null;
			}
		}, 1000);
	}
}

function getOTPCode() {
	fetchOTPCode({
		phoneNumber: otpForm.loginName,
		smsType: 'templateCode',
	})
		.then((response) => {
			if (response && response.code == 200) {
				otpForm.smsId = (response.data as { uuid?: string })?.uuid ?? ''
				countDown(60);
			} else {
				ElMessage.error(response.msg);
			}
		})
		.catch((error: { msg?: string }) => {
			ElMessage.error(error.msg);
			console.log(error);
		});
}
</script>
<style lang="scss" scoped>
.oauth-otplogin {
	padding: 0 14px;
	height: 429px;
	display: flex;
	justify-content: center;
	align-items: center;
	.otp-box {
		position: relative;
	}
	.button-width {
		width: 86px;
	}
	.input-width {
		width: 260px;
		height: 36px;
		:deep(.el-input__inner) {
			height: 36px;
			line-height: 36px;
		}
	}
	.mar-r-28 {
		margin-right: 28px;
	}
	.ca-login-button {
		margin-top: 10px;
	}
	.get-opt-code {
		position: absolute;
		right: 0;
		top: 50%;
		transform: translateY(-50%);
		cursor: pointer;
		color: #4781f3;
		display: inline-block;
		padding: 0 10px;
		&::before {
			content: '';
			border-left: 1px solid #dae2ee;
			padding-right: 10px;
		}
	}
	:deep(.el-form-item) {
		margin-bottom: 24px;
	}
	.uk-dynamic,
	.pin-dynamic {
		width: 260px;
		margin: 0 auto;
	}
	.ca-login-img {
		width: 381px;
		height: 266px;
		margin-right: 88px;
	}
	.dialog-box {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	// 扫码登录
	.phone {
		text-align: center;
		position: relative;
		width: 294px;
		height: 294px;
		display: flex;
		justify-content: center;
		align-items: center;
		// 二维码图片
		.qrcode {
			height: 225px;
			width: 225px;
		}
		// 二维码过期遮罩
		.mask {
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			width: 100%;
			height: 100%;
			background-color: #fff;
			opacity: 0.9;
			position: absolute;
			top: 0;
			left: 0;
		}
		.colorF59 {
			color: #f59a23;
		}
	}
}
</style>
