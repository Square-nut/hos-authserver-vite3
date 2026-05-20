<template>
	<el-form
		ref="loginFormRef"
		:model="loginForm"
		:rules="theme == '1' ? loginRules : {}"
		class="login-form"
		auto-complete="on"
		label-position="left"
	>
		<el-col :span="24" v-if="openTenant">
			<el-form-item prop="tenantId">
				<el-select
					ref="tenantSelectRef"
					@change="changeTenant"
					class="tenantSelect"
					popper-class="tenantPop"
					:placeholder="t('请选择租户')"
					v-model="loginForm.tenantId"
				>
					<el-option
						v-for="(item, index) in tenantData"
						:key="index"
						:label="item.name"
						:value="item.tenantId"
					>
					</el-option>
				</el-select>
				<i class="el-icon-s-home"></i>
			</el-form-item>
		</el-col>

		<el-col :span="24">
			<el-form-item prop="loginName">
				<el-input
					ref="loginNameRef"
					v-model="loginForm.loginName"
					:placeholder="
						grantType != 'AD' ? passwordInfo.accountInfo : t('AD账号')
					"
					name="loginName"
					type="text"
					v-focus
					@change="changeLoginName"
					@keyup.enter="keyEnterLogin('password')"
				>
					<template #prefix>
						<img src="../../assets/images/login/z59.png" alt="" />
					</template>
				</el-input>
			</el-form-item>
		</el-col>
		<el-col :span="24">
			<el-form-item prop="password">
				<el-input
					ref="passwordRef"
					key="password"
					v-model="loginForm.password"
					:type="passwordType"
					:placeholder="t('密码')"
					name="password"
					@keyup.enter="keyEnterLogin('captchaCode')"
				>
					<template #prefix>
						<img src="../../assets/images/login/z60.png" alt="" />
					</template>
					<template #suffix>
						<el-icon class="pwd-toggle" @click="togglePwd"><View /></el-icon>
					</template>
				</el-input>
			</el-form-item>
		</el-col>
		<!--图形验证码的区域-->
		<el-col :span="24" v-if="openCaptcha">
			<el-form-item prop="captchaCode">
				<el-col :span="16" style="padding-right: 15px">
					<el-input
						v-model="loginForm.captchaCode"
						:placeholder="t('请输入图形验证码')"
						type="text"
						@keyup.enter="keyEnterLogin"
					>
						<template #prefix>
							<el-icon><Picture /></el-icon>
						</template>
					</el-input>
				</el-col>
				<el-col :span="8" class="VCode">
					<!--<el-image
                            :src="imgUrl" @click="getCaptcha"></el-image>-->
					<img :src="imgUrl" @click="getCaptcha" />
				</el-col>
			</el-form-item>
		</el-col>
		<!-- 岗位 -->
		<el-col :span="24" v-if="showPostType != 'simple'">
			<el-form-item prop="post">
				<postSelect
					v-if="showPostType == 'professional'"
					ref="userLoginSelectPostRef"
					:type="loginForm.loginName === 'admin' ? '' : 'id'"
					:personId="personId"
					:disabled="!personId"
					:placeholder="postPlaceholder"
					@change="changePost"
				></postSelect>
				<post-select-table
					v-if="showPostType == 'wrought'"
					ref="userLoginSelectTablePostRef"
					uid="userLoginSelectTable_post"
					v-model="loginForm.post"
					:disabled="!personId"
					:placeholder="t('点击登录按钮获取人员定岗数据')"
					:type="loginForm.loginName === 'admin' ? '' : 'id'"
					:personId="personId"
					@change="changePost"
				></post-select-table>
			</el-form-item>
		</el-col>
		<div v-if="theme == '0' && loginErr" class="loginErrBox">
			<span>{{ loginErr }}</span>
		</div>
		<el-col :span="24">
			<el-form-item class="simple-login-btn pure-login-btn">
				<el-button
					:loading="loading"
					type="primary"
					style="width: 100%; margin-bottom: 20px"
					@click="userHandleLogin(true)"
					>{{ t('登录') }}
				</el-button>
				<div
					class="Password_settings"
					v-if="
						(loginPageInfo?.easyHideRetrievePassword ||
							loginPageInfo?.hosHideRetrievePassword) &&
						grantType != 'AD'
					"
				>
					<a @click="handleForgetPass">{{ t('忘记密码？') }}</a>
					<a @click="handleForgetPass">{{ t('找回密码') }}</a>
				</div>
			</el-form-item>
		</el-col>
		<!-- 忘记密码 -->
		<el-biz-dialog
			:title="t('找回密码')"
			uid="forgetPassDialog"
			:append-to-body="true"
			:close-on-click-modal="false"
		>
		</el-biz-dialog>
	</el-form>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { isOpenDb } from '@/utils/is-open-db';
import { useI18n } from 'vue-i18n';
import postSelect from './components/post-select.vue';
import postSelectTable from './components/post-select-table.vue';
import forgetPassword from './forgetPassword.vue';
import { openHosBizDialog } from '@/composables/useHosBiz';
import { Picture, View } from '@element-plus/icons-vue';
import AuthConstant from '@/constant/auth-constant';
import { useUserStore } from '@/stores/user';
import { loginApi } from '@/api/login';
import cryptUtil from '@/utils/crypt/index.js';
import { ref, watch, onMounted, reactive, nextTick } from 'vue';
import type { FormInstance, FormRules, InputInstance } from 'element-plus';

const loginFormRef = ref<FormInstance>();
const userLoginSelectPostRef = ref<InstanceType<typeof postSelect> | null>(
	null
);
const userLoginSelectTablePostRef = ref<InstanceType<
	typeof postSelectTable
> | null>(null);
const loginNameRef = ref<InputInstance | null>(null);
const passwordRef = ref<InputInstance | null>(null);

const { t } = useI18n();
const props = defineProps({
	passwordInfo: {
		type: Object,
		default: () => {},
	},
	loginPageInfo: {
		type: Object,
		default: () => {},
	},
	grantType: {
		type: String,
		required: true,
	},
	showPostType: {
		type: String,
	},
	toggleLoading: {
		type: Number,
		default: 0,
	},
});

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
		el.querySelector('input')?.focus();
	},
};

const postChainId = ref('');
const passwordType = ref('password');
const loginErr = ref('');
const theme = ref(import.meta.env.VITE_APP_THEME_STYLE);
const openTenant = ref(false);
const openCaptcha = ref(false);
const imgUrl = ref('');
const originalOpenCaptcha = ref(false);

interface LoginForm {
	grantType: string;
	loginName: string;
	password: string;
	tenantId: string;
	isRecordLogin: boolean;
	captchaCode: string;
	grantChainId: string;
	captchaUUID: string;
	selectRoleId: string;
	post: string;
}

/** 提交登录接口时的表单（含二次选岗后的 postChainId） */
interface LoginSubmitPayload extends LoginForm {
	postChainId?: string;
}

const loginForm = ref<LoginForm>({
	grantType: props.grantType,
	loginName: '',
	password: '',
	tenantId: '',
	isRecordLogin: true,
	captchaCode: '',
	grantChainId: '',
	captchaUUID: '', // 短信验证码用
	selectRoleId: '',
	post: '',
});

const loginRules = reactive<FormRules<LoginForm>>({
	loginName: [
		{
			required: true,
			trigger: 'change',
			message: t('账号不能为空'),
		},
	],
	password: [
		{
			required: true,
			trigger: 'change',
			message: t('密码不能为空'),
		},
	],
	///租户id
	tenantId: [
		{
			required: true,
			trigger: 'blur',
			message: t('租户不能为空'),
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
			validator: (rule: any, value: string, callback: any) => {
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
interface TenantData {
	tenantId: string;
	name: string;
}
const tenantData = ref<TenantData[]>([]);
const inputValueChanged = ref(false);
const postPlaceholder = ref(t('点击登录按钮后获取岗位单元'));

watch(
	() => loginForm.value.loginName,
	(newVal, oldval) => {
		inputValueChanged.value = newVal !== oldval;
	}
);
watch(
	() => loginForm.value.password,
	(newVal, oldVal) => {
		inputValueChanged.value = newVal !== oldVal;
	}
);
watch(
	() => props.toggleLoading,
	(val) => {
		loading.value = false;
	}
);
onMounted(() => {});
function togglePwd() {
	passwordType.value = passwordType.value === 'password' ? 'text' : 'password';
}
function keyEnterLogin(name: string) {
	///键盘enter事件
	const fieldRef =
		name === 'password'
			? passwordRef
			: name === 'loginName'
				? loginNameRef
				: null;
	if (fieldRef?.value) {
		fieldRef.value.focus();
	} else {
		userHandleLogin(true);
	}
}

const personId = ref('');
///登录操作
function userHandleLogin(isLogin: boolean) {
	loginFormRef.value?.validate((valid) => {
		if (valid !== true) {
			console.log('error submit!!');
			return;
		}
		if (theme.value == '0') {
			if (!loginForm.value.loginName) {
				loginErr.value = t('账号不能为空');
				return;
			}
			if (!loginForm.value.password) {
				loginErr.value = t('密码不能为空');
				return;
			}
			if (openCaptcha.value) {
				if (!loginForm.value.captchaCode) {
					loginErr.value = t('图形验证码不能为空');
					return;
				}
			}
			if (postChainId.value) {
				if (!loginForm.value.post) {
					loginErr.value = t('岗位单元不能为空');
					return;
				}
			}
		}
		// 登录之前判断是否开启弹窗.如果开启,但获取不到IP/MAC,则提示错误信息
		// if (!isOpenDb(loginForm.loginName)) return;
		const upData: LoginSubmitPayload = {
			...loginForm.value,
			password: cryptUtil.crypt(loginForm.value.password),
			...(postChainId.value ? { postChainId: postChainId.value } : {}),
		};
		loading.value = true;
		useUserStore()
			.Login(upData)
			.then((res) => {
				// 登录成功跳转
				if (res && res.code == 200) {
					// 首次点击登录按钮，获取岗位信息并展示下拉列表
					if (res.data.personId && props.showPostType != 'simple') {
						loading.value = false;
						postPlaceholder.value = t('请选择岗位单元');
						personId.value = res.data.personId;
						postChainId.value = res.data.postChainId;
						if (props.showPostType == 'professional') {
							// 下拉选组件
							nextTick(() => {
								userLoginSelectPostRef.value?.getPostPage();
							});
						}
						if (props.showPostType == 'wrought') {
							// 表格组件
							nextTick(() => {
								userLoginSelectTablePostRef.value?.refresh();
							});
						}
					} else if (res.data.againAuthType) {
						// 需要二次认证
						loading.value = false;
						let grantChainId = res.data.grantChainId;
						let authType = res.data.againAuthType;
						let account = res.data.accountCode;
						let caData = res.data.caData;
						let phone = res.data.phone;
						emit(
							'openTwoAuthDialog',
							grantChainId,
							authType,
							account,
							caData,
							phone
						);
					} else {
						// 不需要二次认证
						emit('loginSucessHandler');
					}
				}
			})
			.catch((err) => {
				console.log(err);
				loading.value = false;
				// 开启图形验证码
				if (err.code == '101-002-004-020') {
					openCaptcha.value = true;
					getCaptcha();
				}
				// 刷新图形验证码
				if (err.code == '101-002-004-004' || err.code == '101-002-004-005') {
					getCaptcha();
				}
				if (!err.code.includes('101-002-005-')) {
					ElMessage.error(err.msg);
				}
				// 强制修改密码弹窗
				if (err.code.includes(AuthConstant.forcedJumpSetPassword)) {
					emit('forcedJumpSetPassword', err);
				}
			});
	});
}
// 获取图形验证码
function getCaptcha() {
	loginApi
		.getCaptcha()
		.then((response) => {
			const data = response?.data;
			if (response?.code == 200 && data) {
				imgUrl.value = 'data:image/gif;base64,' + data.img;
				loginForm.value.captchaUUID = data.uuid;
			} else {
				///提示错误信息
				ElMessage.error(t('获取验证码失败，请重新再试！'));
			}
		})
		.catch((error) => {
			console.log(error);
		});
}
function changeTenant(val: string) {
	loginForm.value.tenantId = val;
	reset();
}
// 忘记密码
function handleForgetPass() {
	openHosBizDialog({
		component: forgetPassword,
		_uid: 'forgetPassDialog',
		ref: 'forgetPassDialog',
		props: {},
	});
}
function changeLoginName() {
	reset();
}
function rowDisabledMethod(row: any) {
	return row.activity === false;
}
function reset() {
	postPlaceholder.value = t('点击登录按钮后获取岗位单元');
	personId.value = '';
	postChainId.value = '';
	loginForm.value.post = '';
	userLoginSelectPostRef.value?.clear();
	userLoginSelectTablePostRef.value?.clear();
}
function changePost(id: string, post: any) {
	loginForm.value.post = post;
}
function openLoginBtn() {
	loading.value = false;
}
</script>
<style scoped>
.Password_settings {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	flex-wrap: wrap;
	gap: 8px 12px;
}

.Password_settings a {
	cursor: pointer;
}

.pwd-toggle {
	cursor: pointer;
}

.VCode {
	height: 45px;
}

.VCode img {
	width: 120px;
	height: 45px;
}
</style>
