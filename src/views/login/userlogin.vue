<template>
	<el-form
		ref="loginForm"
		:model="loginForm"
		:rules="theme == 1 ? loginRules : {}"
		class="login-form"
		auto-complete="on"
		label-position="left"
	>
		<el-col :span="24" v-if="openTenant">
			<el-form-item prop="tenantId">
				<el-select
					@change="changeTenant"
					class="tenantSelect"
					popper-class="tenantPop"
					:placeholder="$t('请选择租户')"
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
					ref="loginName"
					v-model="loginForm.loginName"
					:placeholder="
						grantType != 'AD' ? passwordInfo.accountInfo : $t('AD账号')
					"
					name="loginName"
					type="text"
					v-focus
					@change="changeLoginName"
					@keyup.enter="keyEnterLogin('password')"
				>
					<i v-if="theme == 1" class="el-icom-person" alt=""></i>
					<template #prefix>
						<img
							v-if="theme != 1"
							src="../../assets/images/login/z59.png"
							alt=""
						/>
					</template>
				</el-input>
			</el-form-item>
		</el-col>
		<el-col :span="24">
			<el-form-item prop="password">
				<el-input
					key="password"
					ref="password"
					v-model="loginForm.password"
					:type="passwordType"
					:placeholder="$t('密码')"
					name="password"
					@keyup.enter="keyEnterLogin('captchaCode')"
				>
					<i v-if="theme == 1" class="el-icon-lock" alt=""></i>
					<template #prefix>
						<img
							v-if="theme != 1"
							src="../../assets/images/login/z60.png"
							alt=""
						/>
					</template>
					<template #suffix>
						<i @click="togglePwd" class="el-input__icon el-icon-view"></i>
					</template>
				</el-input>
			</el-form-item>
		</el-col>
		<!--图形验证码的区域-->
		<el-col :span="24" v-if="openCaptcha">
			<el-form-item prop="captchaCode">
				<el-col :span="16" style="padding-right: 15px">
					<el-input
						prefix-icon="el-icom-select-grant"
						v-model="loginForm.captchaCode"
						ref="captchaCode"
						:placeholder="$t('请输入图形验证码')"
						type="text"
						@keyup.enter="keyEnterLogin"
					>
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
					ref="userLoginSelect_post"
					:type="loginForm.loginName === 'admin' ? '' : 'id'"
					:personId="personId"
					:disabled="!personId"
					:placeholder="postPlaceholder"
					@change="changePost"
				></postSelect>
				<post-select-table
					v-if="showPostType == 'wrought'"
					ref="userLoginSelectTable_post"
					uid="userLoginSelectTable_post"
					v-model="loginForm.post"
					:disabled="!personId"
					:placeholder="$t('点击登录按钮获取人员定岗数据')"
					:type="loginForm.loginName === 'admin' ? '' : 'id'"
					:personId="personId"
					@change="changePost"
				></post-select-table>
			</el-form-item>
		</el-col>
		<div v-if="theme == 0 && loginErr" class="loginErrBox">
			<span>{{ loginErr }}</span>
		</div>
		<el-col :span="24">
			<el-form-item class="simple-login-btn pure-login-btn">
				<el-button
					:loading="loading"
					type="primary"
					style="width: 100%; margin-bottom: 20px"
					@click="userHandleLogin(true)"
					>{{ $t('登录') }}
				</el-button>
				<el-row
					class="Password_settings"
					v-if="
						(loginPageInfo?.easyHideRetrievePassword ||
							loginPageInfo?.hosHideRetrievePassword) &&
						grantType != 'AD'
					"
				>
					<!--忘记密码-->
					<a @click="handleForgetPass">{{ $t('忘记密码？') }}</a>
				</el-row>
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
</template>

<script setup>
import { isOpenDb } from '@/utils/is-open-db';
import postSelect from './components/post-select.vue';
import postSelectTable from './components/post-select-table.vue';
import forgetPassword from './forgetPassword.vue';
import AuthConstant from '@/constant/auth-constant';
import { useUserStore } from '@/stores/user';
import { ref, watch, useTemplateRef, nextTick, emit, getCurrentInstance } from 'vue';

const proxy = getCurrentInstance().proxy;

const props = defineProps({
		// 账号密码登录
		passwordInfo: {
			type: Object,
			default: () => {},
		},
		// 登录配置
		loginPageInfo: {
			type: Object,
			default: () => {},
		},
		grantType: {
			type: String,
			required: true,
		},
		// 岗位组件类型 true：下拉选，false：表格
		showPostType: {
			type: String,
		},
		toggleLoading: {
			type: Number,
			default: 0,
		},
})
	const post = ref('');
	const personId = ref('');
	const postChainId = ref('');
	const passwordType = ref('password');
	const loginErr = ref('');
	const theme = ref(import.meta.env.VITE_APP_THEME_STYLE);
	const openTenant = ref(false);
	const openCaptcha = ref(false);
	const imgUrl = ref('');
	const originalOpenCaptcha = ref(false);
	const loginForm = ref({
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
	const loginRules = ref({
		loginName: [
			{
				required: true,
				trigger: 'change',
				message: this.$t('账号不能为空'),
			},
		],
		password: [
			{
				required: true,
				trigger: 'change',
				message: this.$t('密码不能为空'),
			},
		],
		tenantId: [
			{
				required: true,
				trigger: 'blur',
				message: this.$t('租户不能为空'),
			},
		],
		captchaCode: [
			{
				required: false,
				trigger: 'blur',
				message: this.$t('图形验证码不能为空'),
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
								callback(new Error(props.$t('人员定岗数据不能为空')));
							} else {
								callback(new Error(props.$t('岗位单元不能为空')));
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
	})

	watch(loginForm.value.loginName, (newVal, oldval) => {
		inputValueChanged.value = newVal !== oldval;
	});
	watch(loginForm.value.password, (newVal, oldval) => {
		inputValueChanged.value = newVal !== oldval;
	});
	watch(toggleLoading, (val) => {
		loading.value = false;
	});

	const togglePwd = () => {
		passwordType.value =
			passwordType.value === 'password' ? 'text' : 'password';
	}
	const keyEnterLogin = (name) => {
		///键盘enter事件
		if (refs[name]) {
			refs[name].focus();
		} else {
			userHandleLogin(true);
		}
	}
		///登录操作
		function userHandleLogin(isLogin) {
			useTemplateRef('loginForm').validate((valid) => {
				if (valid) {
					if (theme.value == 0) {
						if (!loginForm.value.loginName) {
							loginErr.value = $t('账号不能为空');
							return false;
						}
						if (!this.loginForm.password) {
							loginErr.value = $t('密码不能为空');
							return false;
						}
						if (openCaptcha.value) {
							if (!loginForm.value.captchaCode) {
								loginErr.value = $t('图形验证码不能为空');
								return false;
							}
						}
							if (postChainId.value) {
							if (!loginForm.value.post) {
								loginErr.value = $t('岗位单元不能为空');
								return false;
							}
						}
					}
					// 登录之前判断是否开启弹窗.如果开启,但获取不到IP/MAC,则提示错误信息
					// if (!isOpenDb(this.loginForm.loginName)) return false;
					let upData = Object.assign({}, loginForm.value, {
						password: $m.crypt(loginForm.value.password),
					});
					if (postChainId.value) {
						upData.postChainId = postChainId.value;
					}
					loading.value = true;
					useUserStore()
						.Login(upData)
						.then((res) => {
							// 登录成功跳转
							if (res && res.code == 200) {
								// 首次点击登录按钮，获取岗位信息并展示下拉列表
									if (res.data.personId && showPostType.value != 'simple') {
									loading.value = false;
									postPlaceholder.value = $t('请选择岗位单元');
									personId.value = res.data.personId;
									postChainId.value = res.data.postChainId;
									if (showPostType.value == 'professional') {
										// 下拉选组件
										nextTick(() => {
											useTemplateRef('userLoginSelect_post').getPostPage();
										});
									}
									if (this.showPostType == 'wrought') {
										// 表格组件
										nextTick(() => {
											useTemplateRef('userLoginSelectTable_post').refresh();
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
									emit('openTwoAuthDialog',
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
							if (
								err.code == '101-002-004-004' ||
								err.code == '101-002-004-005'
							) {
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
				} else {
					console.log('error submit!!');
					return false;
				}
			});
		}
		// 获取图形验证码
		function getCaptcha() {
			proxy.$api('getCaptcha')
				.then((response) => {
					if (response && response.code == 200) {
						this.imgUrl = 'data:image/gif;base64,' + response.data.img;
						this.loginForm.captchaUUID = response.data.uuid;
					} else {
						///提示错误信息
						this.$message.error(this.$t('获取验证码失败，请重新再试！'));
					}
				})
				.catch((error) => {
					console.log(error);
				});
		},
		changeTenant(val) {
			this.loginForm.tenantId = val;
			this.selectTenant(val);
			this.reset();
		},
		// 忘记密码
		handleForgetPass() {
			this.$store.commit('OPEN_DIALOG', {
				component: forgetPassword,
				_uid: 'forgetPassDialog',
				ref: 'forgetPassDialog',
				props: {},
			});
		},
		changeLoginName() {
			this.reset();
		},
		rowDisabledMethod(row) {
			return row.activity === false;
		},
		reset() {
			this.postPlaceholder = this.$t('点击登录按钮后获取岗位单元');
			this.personId = '';
			this.postChainId = '';
			this.loginForm.post = '';
			if (this.$refs.userLoginSelect_post)
				this.$refs.userLoginSelect_post.clear();
			if (this.$refs.userLoginSelectTable_post)
				this.$refs.userLoginSelectTable_post.clear();
		},
		changePost(id, post) {
			this.loginForm.post = post;
		},
		openLoginBtn() {
			this.loading = false;
		},
	},
};
</script>
<style scoped lang="scss">
.Password_settings {
	a {
		cursor: pointer;
	}
}
.VCode {
	height: 45px;
	img {
		width: 120px;
		height: 45px;
	}
}
</style>
