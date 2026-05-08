<template>
	<hos-form
		ref="loginForm"
		:model="loginForm"
		:rules="theme == 1 ? loginRules : {}"
		class="login-form"
		auto-complete="on"
		label-position="left"
	>
		<hos-col :span="24" v-if="openTenant">
			<hos-form-item prop="tenantId">
				<hos-select
					@change="changeTenant"
					class="tenantSelect"
					popper-class="tenantPop"
					:placeholder="$t('请选择租户')"
					v-model="loginForm.tenantId"
				>
					<hos-option
						v-for="(item, index) in tenantData"
						:key="index"
						:label="item.name"
						:value="item.tenantId"
					>
					</hos-option>
				</hos-select>
				<i class="hos-icon-s-home"></i>
			</hos-form-item>
		</hos-col>

		<hos-col :span="24">
			<hos-form-item prop="loginName">
				<hos-input
					ref="loginName"
					v-model="loginForm.loginName"
					:placeholder="
						grantType != 'AD' ? passwordInfo.accountInfo : $t('AD账号')
					"
					name="loginName"
					type="text"
					v-focus
					@change="changeLoginName"
					@keyup.enter.native="keyEnterLogin('password')"
				>
					<i v-if="theme == 1" class="hos-icom-person" alt=""></i>
					<img
						v-else
						src="../../assets/images/login/z59.png"
						slot="prefix"
						alt=""
					/>
				</hos-input>
			</hos-form-item>
		</hos-col>
		<hos-col :span="24">
			<hos-form-item prop="password">
				<hos-input
					key="password"
					ref="password"
					v-model="loginForm.password"
					:type="passwordType"
					:placeholder="$t('密码')"
					name="password"
					@keyup.enter.native="keyEnterLogin('captchaCode')"
				>
					<i v-if="theme == 1" class="hos-icon-lock" alt=""></i>
					<img
						v-else
						src="../../assets/images/login/z60.png"
						slot="prefix"
						alt=""
					/>
					<i
						@click="togglePwd"
						slot="suffix"
						class="hos-input__icon hos-icon-view"
					></i>
				</hos-input>
			</hos-form-item>
		</hos-col>
		<!--图形验证码的区域-->
		<hos-col :span="24" v-if="openCaptcha">
			<hos-form-item prop="captchaCode">
				<hos-col :span="16" style="padding-right: 15px">
					<hos-input
						prefix-icon="hos-icom-select-grant"
						v-model="loginForm.captchaCode"
						ref="captchaCode"
						:placeholder="$t('请输入图形验证码')"
						type="text"
						@keyup.enter.native="keyEnterLogin"
					>
					</hos-input>
				</hos-col>
				<hos-col :span="8" class="VCode">
					<!--<hos-image
                            :src="imgUrl" @click="getCaptcha"></hos-image>-->
					<img :src="imgUrl" @click="getCaptcha" />
				</hos-col>
			</hos-form-item>
		</hos-col>
		<!-- 岗位 -->
		<hos-col :span="24" v-if="showPostType != 'simple'">
			<hos-form-item prop="post">
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
			</hos-form-item>
		</hos-col>
		<div v-if="theme == 0 && loginErr" class="loginErrBox">
			<span>{{ loginErr }}</span>
		</div>
		<hos-col :span="24">
			<hos-form-item class="simple-login-btn pure-login-btn">
				<hos-button
					:loading="loading"
					type="primary"
					style="width: 100%; margin-bottom: 20px"
					@click="userHandleLogin(true)"
					>{{ $t('登录') }}
				</hos-button>
				<hos-row
					class="Password_settings"
					v-if="
						(loginPageInfo?.easyHideRetrievePassword ||
							loginPageInfo?.hosHideRetrievePassword) &&
						grantType != 'AD'
					"
				>
					<!--忘记密码-->
					<a @click="handleForgetPass">{{ $t('忘记密码？') }}</a>
				</hos-row>
			</hos-form-item>
		</hos-col>
		<!-- 忘记密码 -->
		<hos-biz-dialog
			:title="$t('找回密码')"
			uid="forgetPassDialog"
			:append-to-body="true"
			:close-on-click-modal="false"
		>
		</hos-biz-dialog>
	</hos-form>
</template>

<script>
import { mapActions } from 'vuex';
import { isOpenDb } from '@/utils/is-open-db';
import postSelect from './components/post-select.vue';
import postSelectTable from './components/post-select-table.vue';
import AuthConstant from '@/constant/auth-constant';

export default {
	name: 'userlogin',
	components: { postSelect, postSelectTable },
	props: {
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
	},
	directives: {
		focus: {
			// 指令的定义
			inserted: function (el) {
				el.getElementsByClassName('hos-input__inner')[0].focus();
			},
		},
	},
	data() {
		///校验是否是手机号或者邮箱
		return {
			post: '',
			personId: '',
			postChainId: '',
			passwordType: 'password',
			loginErr: '', // 错误信息
			theme: process.env.VUE_APP_SIMPLE_ONCE, // 当前ui样式  hos / 极简
			openTenant: false, //是否开启租户
			openCaptcha: false, //开启图形验证码
			imgUrl: '', //图形验证码,给个默认的图片
			originalOpenCaptcha: false,
			loginForm: {
				grantType: this.grantType,
				loginName: '',
				password: '',
				tenantId: '',
				isRecordLogin: true,
				captchaCode: '',
				grantChainId: '',
				captchaUUID: '', // 短信验证码用
				selectRoleId: '',
				post: '',
			},
			loginRules: {
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
				///租户id
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
							if (this.postChainId) {
								if (!value) {
									if (this.showPostType == 'wrought') {
										callback(new Error(this.$t('人员定岗数据不能为空')));
									} else {
										callback(new Error(this.$t('岗位单元不能为空')));
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
			},
			loading: false,
			postPlaceholder: this.$t('点击登录按钮后获取岗位单元'),
		};
	},
	watch: {
		'loginForm.loginName': function (newVal, oldval) {
			this.inputValueChanged = newVal !== oldval;
		},
		'loginForm.password': function (newVal, oldval) {
			this.inputValueChanged = newVal !== oldval;
		},
		toggleLoading: function (val) {
			this.loading = false;
		},
	},
	created() {},
	methods: {
		togglePwd() {
			this.passwordType =
				this.passwordType === 'password' ? 'text' : 'password';
		},
		...mapActions(['Login']),
		keyEnterLogin(name) {
			///键盘enter事件
			if (this.$refs[name]) {
				this.$refs[name].focus();
			} else {
				this.userHandleLogin(true);
			}
		},
		///登录操作
		userHandleLogin(isLogin) {
			this.$refs.loginForm.validate((valid) => {
				if (valid) {
					if (this.theme == 0) {
						if (!this.loginForm.loginName) {
							this.loginErr = this.$t('账号不能为空');
							return false;
						}
						if (!this.loginForm.password) {
							this.loginErr = this.$t('密码不能为空');
							return false;
						}
						if (this.openCaptcha) {
							if (!this.loginForm.captchaCode) {
								this.loginErr = this.$t('图形验证码不能为空');
								return false;
							}
						}
						if (this.postChainId) {
							if (!this.loginForm.post) {
								this.loginErr = this.$t('岗位单元不能为空');
								return false;
							}
						}
					}
					// 登录之前判断是否开启弹窗.如果开启,但获取不到IP/MAC,则提示错误信息
					// if (!isOpenDb(this.loginForm.loginName)) return false;
					let upData = Object.assign({}, this.loginForm, {
						password: this.$m.crypt(this.loginForm.password),
					});
					if (this.postChainId) {
						upData.postChainId = this.postChainId;
					}
					this.loading = true;
					this.Login(upData)
						.then((res) => {
							// 登录成功跳转
							if (res && res.code == 200) {
								// 首次点击登录按钮，获取岗位信息并展示下拉列表
								if (res.data.personId && this.showPostType != 'simple') {
									this.loading = false;
									this.postPlaceholder = this.$t('请选择岗位单元');
									this.personId = res.data.personId;
									this.postChainId = res.data.postChainId;
									if (this.showPostType == 'professional') {
										// 下拉选组件
										this.$nextTick(() => {
											this.$refs.userLoginSelect_post.getPostPage();
										});
									}
									if (this.showPostType == 'wrought') {
										// 表格组件
										this.$nextTick(() => {
											this.$refs.userLoginSelectTable_post.refresh();
										});
									}
								} else if (res.data.againAuthType) {
									// 需要二次认证
									this.loading = false;
									let grantChainId = res.data.grantChainId;
									let authType = res.data.againAuthType;
									let account = res.data.accountCode;
									let caData = res.data.caData;
									let phone = res.data.phone;
									this.$emit(
										'openTwoAuthDialog',
										grantChainId,
										authType,
										account,
										caData,
										phone
									);
								} else {
									// 不需要二次认证
									this.$emit('loginSucessHandler');
								}
							}
						})
						.catch((err) => {
							console.log(err);
							this.loading = false;
							// 开启图形验证码
							if (err.code == '101-002-004-020') {
								this.openCaptcha = true;
								this.getCaptcha();
							}
							// 刷新图形验证码
							if (
								err.code == '101-002-004-004' ||
								err.code == '101-002-004-005'
							) {
								this.getCaptcha();
							}
							if (!err.code.includes('101-002-005-')) {
								this.$message.error(err.msg);
							}
							// 强制修改密码弹窗
							if (err.code.includes(AuthConstant.forcedJumpSetPassword)) {
								this.$emit('forcedJumpSetPassword', err);
							}
						});
				} else {
					console.log('error submit!!');
					return false;
				}
			});
		},
		// 获取图形验证码
		getCaptcha() {
			this.$api('getCaptcha')
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
				component: require('./forgetPassword.vue').default,
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
