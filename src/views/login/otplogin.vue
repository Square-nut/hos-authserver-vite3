<template>
	<el-row>
		<el-form
			ref="otpLoginFormRef"
			:model="otpLoginForm"
			:rules="otpLoginRules"
			class="login-form"
			auto-complete="on"
			label-position="left"
		>
			<el-col :span="24" v-if="openTenant">
				<el-form-item prop="tenantId">
					<el-select
						disabled
						class="tenantSelect"
						popper-class="tenantPop"
						:placeholder="$t('请选择租户')"
						v-model="otpLoginForm.tenantId"
					>
						<el-option
							v-for="(item, index) in tenantData"
							:key="index"
							:label="item.name"
							:value="item.tenantId"
						>
						</el-option>
					</el-select>
					<el-icon><House /></el-icon>
				</el-form-item>
			</el-col>

			<el-col :span="24">
				<el-form-item prop="loginName">
					<el-input
						ref="loginNameRef"
						v-model="otpLoginForm.loginName"
						:placeholder="$t('请输入手机号')"
						name="loginName"
						type="text"
						v-focus
						@keyup.enter="keyEnterLogin('smsCode')"
						@change="changeLoginName"
					>
						<template #prefix>
							<el-icon><User /></el-icon>
						</template>
					</el-input>
				</el-form-item>
			</el-col>
			<!--短信验证码的区域-->
			<el-col :span="24">
				<el-form-item prop="smsCode">
					<el-col :span="24">
						<div class="otp-box">
							<el-input
								v-model="otpLoginForm.smsCode"
								ref="smsCodeRef"
								:placeholder="$t('请输入验证码')"
								type="text"
								@keyup.enter="keyEnterLogin"
							>
								<template #prefix>
									<el-icon><Message /></el-icon>
								</template>
							</el-input>
							<span class="get-opt-code" @click="openSlider()">{{
								!btnShow ? `${count}${$t('s后重新获取')}` : $t('获取验证码')
							}}</span>
						</div>
					</el-col>
				</el-form-item>
			</el-col>
			<!-- 图形验证码的区域 -->
			<el-col :span="24" v-if="openCaptcha">
				<el-form-item prop="captchaCode">
					<el-col :span="16">
						<el-input
							v-model="otpLoginForm.captchaCode"
							ref="captchaCodeRef"
							:placeholder="$t('请输入图形验证码')"
							type="text"
							@keyup.enter="keyEnterLogin"
						>
							<template #prefix>
								<el-icon><Picture /></el-icon>
							</template>
						</el-input>
					</el-col>
					<el-col :span="8" class="VCode">
						<img :src="imgUrl" @click="getCaptcha" />
					</el-col>
				</el-form-item>
			</el-col>
			<!-- 岗位 -->
			<el-col :span="24" v-if="!Simple">
				<el-form-item prop="post">
					<postSelect
						v-if="showPostType"
						ref="otpLoginSelectPostRef"
						type="id"
						:personId="personId"
						:disabled="!personId"
						:placeholder="postPlaceholder"
						@change="changePost"
					></postSelect>
					<post-select-table
						v-else
						type="id"
						ref="otpLoginSelectTablePostRef"
						uid="otpLoginSelectTable_post"
						v-model="otpLoginForm.post"
						:disabled="!personId"
						:placeholder="$t('点击登录按钮获取人员定岗数据')"
						@change="changePost"
					></post-select-table>
				</el-form-item>
			</el-col>
			<el-col :span="24">
				<el-form-item>
					<el-button
						:loading="loading"
						type="primary"
						style="width: 100%; margin-bottom: 20px"
						@click="otpHandleLogin(true)"
						>{{ $t('登录') }}
					</el-button>
					<!-- <el-form-item> -->
					<!-- <el-row class="Password_settings" v-if="loginPageInfo?.easyHideRetrievePassword || loginPageInfo?.hosHideRetrievePassword"> -->
					<!--忘记密码-->
					<!-- <a @click="handleForgetPass">{{ $t("忘记密码？") }}</a>
                    </el-row> -->
					<!-- </el-form-item> -->
				</el-form-item>
			</el-col>
			<!-- 忘记密码 -->
			<el-biz-dialog
				:title="$t('找回密码')"
				uid="forgetPassDialog"
				:append-to-body="true"
				:close-on-click-modal="false"
			>
			</el-biz-dialog>
		</el-form>
		<slideVerify
			v-if="showOTPSlider"
			type="image"
			:pcode="pcode"
			v-model="slideValue"
			@success="onSuccess"
			@close="closeDialog"
		/>
		<div v-if="showOTPSlider" class="slide-verify-mask"></div>
	</el-row>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules, InputInstance } from 'element-plus';
import AuthConstant from '@/constant/auth-constant';
import { validPhone11, validEmail } from '@/utils/validateUtil';
import postSelect from '@/components/post-select.vue';
import postSelectTable from '@/components/post-select-table.vue';
import forgetPassword from './forgetPassword.vue';
import { useUserStore } from '@/stores/user';
import {
	getOTPCode as fetchOTPCode,
	getCaptcha as fetchCaptcha,
} from '@/api/login';
import { openHosBizDialog } from '@/composables/useHosBiz';
import { crypt } from '@/composables/useCrypt';
import { lsGet } from '@/utils/ls';
import { House, Message, Picture, User } from '@element-plus/icons-vue';
import slideVerify from '@/components/Slide-verify/index.vue';
import generateRandomString from '@/utils/generate-random-string';
import { isSuccessCode } from '@/types/api-common';

const { t } = useI18n();

const props = defineProps<{
	grantChainId?: string;
	loginSucessHandler?: () => void;
	loginPageInfo?: Record<string, unknown>;
	showPostType?: string;
	toggleLoading?: number;
}>();

const emit = defineEmits<{
	(
		e: 'openTwoAuthDialog',
		grantChainId: string,
		authType: string,
		account: string,
		caData: unknown,
		phone: string
	): void;
	(e: 'loginSucessHandler'): void;
	(e: 'forcedJumpSetPassword', err: unknown): void;
}>();

const vFocus = {
	mounted(el: HTMLElement) {
		(el.getElementsByClassName('el-input__inner')[0] as HTMLInputElement)?.focus();
	},
};

const otpLoginFormRef = ref<FormInstance>();
const loginNameRef = ref<InputInstance | null>(null);
const smsCodeRef = ref<InputInstance | null>(null);
const captchaCodeRef = ref<InputInstance | null>(null);
const otpLoginSelectPostRef = ref<InstanceType<typeof postSelect> | null>(
	null
);
const otpLoginSelectTablePostRef = ref<InstanceType<
	typeof postSelectTable
> | null>(null);

const post = ref('');
const personId = ref('');
const postChainId = ref('');
const form = reactive({
	model: {
		query: '',
		dataType: '',
	},
});
const cols = [
	{
		prop: 'name',
		label: t('名称'),
		width: '150px',
	},
	{
		label: t('岗位'),
		prop: 'postNames',
	},
];
const valueConfig = {
	label: 'name',
	value: 'id',
};
const options = [
	{
		label: t('岗位单元'),
		value: 'unit',
	},
	{
		label: t('岗位组'),
		value: 'group',
	},
	{
		label: t('岗位'),
		value: 'post',
	},
];
const openTenant = ref(false);
const openCaptcha = ref(false);
const originalOpenCaptcha = ref(false);

interface OtpLoginForm {
	grantType: string;
	loginName: string;
	tenantId: string;
	smsCode: string;
	smsId: string;
	selectRoleId: string;
	grantChainId: string;
	captchaUUID: string;
	captchaCode: string;
	post: string;
	loginType?: string;
}

const otpLoginForm = ref<OtpLoginForm>({
	grantType: 'sms',
	loginName: '',
	tenantId: '',
	smsCode: '',
	smsId: '',
	selectRoleId: '',
	grantChainId: '',
	captchaUUID: '',
	captchaCode: '',
	post: '',
});
const loginType = ref('phone');

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
		loginType.value = type;
		callback();
	}
};

const otpLoginRules = reactive<FormRules<OtpLoginForm>>({
	loginName: [{ validator: validatePhoneAndMail, trigger: 'blur' }],
	tenantId: [
		{
			required: false,
			trigger: 'blur',
			message: t('租户不能为空'),
		},
	],
	smsCode: [
		{
			required: true,
			trigger: 'blur',
			message: t('验证码不能为空'),
		},
	],
	captchaCode: [
		{
			required: false,
			trigger: 'blur',
			message: t('图形验证码不能为空'),
		},
	],
	post: [
		{
			required: true,
			trigger: 'blur',
			validator: (rule, value, callback) => {
				if (postChainId.value) {
					if (!value) {
						if (props.showPostType == 'wrought') {
							callback(new Error(t('人员定岗数据不能为空')));
						} else {
							callback(new Error(t('岗位单元不能为空')));
						}
					} else {
						callback();
					}
				} else {
					callback();
				}
			},
		},
	],
});

const loading = ref(false);
const tenantData = ref<Array<{ name: string; tenantId: string }>>([]);
const isRoleOrg = ref(false);
const oAuthId = ref('');
const source = ref('');
const roleId = ref<unknown[]>([]);
const roleName = ref<unknown[]>([]);
const inputValueChanged = ref(false);
const roleData = ref<unknown[]>([]);
const btnShow = ref(true);
const count = ref<number | string>('');
const timer = ref<ReturnType<typeof setInterval> | null>(null);
const imgUrl = ref('');
const postPlaceholder = ref(t('点击登录按钮后获取岗位单元'));
const showOTPSlider = ref(false);
const slideValue = ref(0);
const pcode = ref('');
const resetSlider = ref(0);
const disabledSlider = ref(false);

const Simple = computed(
	() => lsGet('hos_login_post_type') == 'simple'
);

watch(
	() => props.toggleLoading,
	() => {
		loading.value = false;
	}
);

function keyEnterLogin(name?: string) {
	const refMap: Record<string, typeof smsCodeRef> = {
		smsCode: smsCodeRef,
		captchaCode: captchaCodeRef,
	};
	if (name && refMap[name]?.value) {
		refMap[name].value!.focus();
	} else {
		otpHandleLogin(true);
	}
}

function otpHandleLogin(isLogin: boolean) {
	otpLoginFormRef.value?.validate((valid) => {
		if (valid) {
			otpLoginForm.value.grantChainId = props.grantChainId ?? '';
			otpLoginForm.value.loginType = loginType.value;
			const paramData = JSON.parse(JSON.stringify(otpLoginForm.value));
			if (postChainId.value) {
				paramData.postChainId = postChainId.value;
			}
			loading.value = true;
			useUserStore()
				.Login(paramData)
				.then((res) => {
					if (res && isSuccessCode(res.code)) {
						if (res.data.personId && !Simple.value) {
							postPlaceholder.value = t('请选择岗位单元');
							personId.value = res.data.personId;
							postChainId.value = res.data.postChainId;
							if (props.showPostType) {
								nextTick(() => {
									otpLoginSelectPostRef.value?.getPostPage();
								});
							} else {
								nextTick(() => {
									otpLoginSelectTablePostRef.value?.refresh();
								});
							}
							loading.value = false;
						} else if (res.data.againAuthType) {
							loading.value = false;
							const grantChainIdVal = res.data.grantChainId;
							const authType = res.data.againAuthType;
							const account = res.data.accountCode;
							const caData = res.data.caData;
							const phone = res.data.phone;
							emit(
								'openTwoAuthDialog',
								grantChainIdVal,
								authType,
								account,
								caData,
								phone
							);
						} else {
							emit('loginSucessHandler');
						}
					}
				})
				.catch((err: { code?: string; msg?: string }) => {
					loading.value = false;
					if (err.code == '101-002-004-020') {
						openCaptcha.value = true;
						getCaptcha();
					}
					const errCode = String(err?.code ?? '');
					if (!errCode.includes('101-002-005-')) {
						ElMessage.error(err?.msg ?? t('登录失败'));
					}
					if (errCode.includes(AuthConstant.forcedJumpSetPassword)) {
						emit('forcedJumpSetPassword', err);
					}
				});
		} else {
			console.log('error submit!!');
		}
	});
}

function getCode() {
	if (!btnShow.value) {
		return;
	}
	otpLoginRules.smsCode = {
		required: false,
		trigger: 'blur',
		message: '',
	};
	otpLoginFormRef.value?.validate((valid) => {
		if (valid) {
			getOTPCode();
		}
	});
	otpLoginRules.smsCode = {
		required: true,
		trigger: 'blur',
		message: t('验证码不能为空'),
	};
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

function getCertCode() {
	const cert = crypt(otpLoginForm.value.loginName);
	return `${generateRandomString(10)}${cert}${generateRandomString(10)}`;
}

function getOTPCode(token?: string) {
	const phoneForm = token
		? { code: getCertCode(), token }
		: {
				phoneNumber: otpLoginForm.value.loginName,
				smsType: 'templateCode',
			};
	return fetchOTPCode(phoneForm)
		.then((response) => {
			if (response && isSuccessCode(response.code)) {
				otpLoginForm.value.smsId = (response.data as { uuid?: string })?.uuid ?? '';
				if (!token) {
					countDown(60);
				}
			} else {
				btnShow.value = true;
				if (timer.value) {
					clearInterval(timer.value);
				}
				timer.value = null;
				ElMessage.error(
					response?.msg ?? t('获取验证码失败，请重新再试！')
				);
			}
		})
		.catch((error: { msg?: string }) => {
			btnShow.value = true;
			if (timer.value) {
				clearInterval(timer.value);
			}
			timer.value = null;
			ElMessage.error(error?.msg ?? t('获取验证码失败，请重新再试！'));
			console.log(error);
		});
}

function openSlider() {
	if (!btnShow.value) return;
	if (!otpLoginForm.value.loginName?.trim()) return;
	disabledSlider.value = false;
	pcode.value = crypt(otpLoginForm.value.loginName) || '';
	showOTPSlider.value = true;
}

function onSuccess(val: unknown) {
	btnShow.value = false;
	showOTPSlider.value = false;
	disabledSlider.value = true;
	getOTPCode(val as string);
}

function closeDialog() {
	showOTPSlider.value = false;
	btnShow.value = true;
}

function getCaptcha() {
	fetchCaptcha()
		.then((response) => {
			if (response && isSuccessCode(response.code) && response.data) {
				imgUrl.value = 'data:image/gif;base64,' + response.data.img;
				otpLoginForm.value.captchaUUID = response.data.uuid;
			} else {
				ElMessage.error(t('获取验证码失败，请重新再试！'));
			}
		})
		.catch((error) => {
			console.log(error);
		});
}

function handleForgetPass() {
	openHosBizDialog({
		component: forgetPassword,
		_uid: 'forgetPassDialog',
		ref: 'forgetPassDialog',
		props: {},
	});
}

function changeLoginName() {
	resetSlider.value = Date.now();
	reset();
}

function reset() {
	postPlaceholder.value = t('点击登录按钮后获取岗位单元');
	personId.value = '';
	postChainId.value = '';
	otpLoginForm.value.post = '';
	otpLoginSelectPostRef.value?.clear();
	otpLoginSelectTablePostRef.value?.clear();
}

function changePost(_id: string | number, postVal: unknown) {
	otpLoginForm.value.post = postVal as string;
}

function openLoginBtn() {
	loading.value = false;
}

defineExpose({ openLoginBtn });
</script>

<style lang="scss" scoped>
.otp-box {
	position: relative;
}
.get-opt-code {
	position: absolute;
	right: 10px;
	top: 50%;
	transform: translateY(-50%);
	cursor: pointer;
	color: #41f0ff;
}
.Password_settings {
	a {
		cursor: pointer;
	}
}
.slide-verify-mask {
	position: fixed;
	inset: 0;
	z-index: 10000;
	background: rgba(0, 0, 0, 0.45);
}
</style>
