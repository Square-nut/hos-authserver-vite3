<template>
	<el-row>
		<el-form
			ref="otpLoginForm"
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
						ref="loginName"
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
								ref="smsCode"
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
							ref="captchaCode"
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
						ref="otpLoginSelect_post"
						type="id"
						:personId="personId"
						:disabled="!personId"
						:placeholder="postPlaceholder"
						@change="changePost"
					></postSelect>
					<post-select-table
						v-else
						type="id"
						ref="otpLoginSelectTable_post"
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

<script>
import AuthConstant from '@/constant/auth-constant';
import { validPhone11, validEmail } from '@/utils/validateUtil';
import { getLoginErrorDesc } from './js/login';
import postSelect from '@/components/post-select.vue';
import postSelectTable from '@/components/post-select-table.vue';
import forgetPassword from './forgetPassword.vue';
import { useUserStore } from '@/stores/user';
import {
	getOTPCode as fetchOTPCode,
	getCaptcha as fetchCaptcha,
} from '@/api/login';
import { openHosBizDialog } from '@/composables/useHosBiz';
import { House, Message, Picture, User } from '@element-plus/icons-vue';
import slideVerify from '@/components/Slide-verify/index.vue';
import cryptUtil from '@/utils/crypt/index.js';
import generateRandomString from '@/utils/generate-random-string.js';
import { isSuccessCode } from '@/types/api-common';
import { ElMessage } from 'element-plus';
export default {
	name: 'otplogin',
	components: {
		postSelect,
		postSelectTable,
		slideVerify,
		User,
		Message,
		Picture,
		House,
	},
	directives: {
		focus: {
			// 指令的定义
			mounted: function (el) {
				el.getElementsByClassName('el-input__inner')[0].focus();
			},
		},
	},
	data() {
		const validatePhoneAndMail = (rule, value, callback) => {
			let type = '';
			if (validPhone11(value)) {
				type = 'phone';
			}
			if (validEmail(value)) {
				type = 'mail';
			}
			if (type == '') {
				callback(new Error(this.$t('请输入有效的手机号')));
			} else {
				this.loginType = type;
				callback();
			}
		};
		return {
			post: '',
			personId: '',
			postChainId: '',
			form: {
				model: {
					query: '',
					dataType: '',
				},
			},
			cols: [
				{
					prop: 'name',
					label: this.$t('名称'),
					width: '150px',
				},
				// {
				// 	prop: 'type',
				// 	width: '80px',
				// 	label: this.$t('类型'),
				// 	formatter: (row, column, value) => {
				// 		return row.type == 'unit'
				// 			? this.$t('岗位单元')
				// 			: row.type == 'group'
				// 			? this.$t('岗位组')
				// 			: this.$t('岗位');
				// 	},
				// },
				// {
				// 	label: this.$t('业务单元'),
				// 	prop: 'buNames',
				// },
				{
					label: this.$t('岗位'),
					prop: 'postNames',
				},
			],
			valueConfig: {
				label: 'name',
				value: 'id',
			},
			options: [
				{
					label: this.$t('岗位单元'),
					value: 'unit',
				},
				{
					label: this.$t('岗位组'),
					value: 'group',
				},
				{
					label: this.$t('岗位'),
					value: 'post',
				},
			],
			openTenant: false, //是否开启租户
			openCaptcha: false, //开启图形验证码
			originalOpenCaptcha: false,
			otpLoginForm: {
				grantType: 'sms',
				loginName: '',
				tenantId: '',
				smsCode: '',
				smsId: '',
				selectRoleId: '',
				grantChainId: '',
				captchaUUID: '', // 图形验证码uuid
				captchaCode: '',
				post: '',
			},
			loginType: 'phone',
			otpLoginRules: {
				loginName: [{ validator: validatePhoneAndMail, trigger: 'blur' }],
				///租户id 不能为空
				tenantId: [
					{
						required: false,
						trigger: 'blur',
						message: this.$t('租户不能为空'),
					},
				],
				///口令不能为空
				smsCode: [
					{
						required: true,
						trigger: 'blur',
						message: this.$t('验证码不能为空'),
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
			tenantData: [],
			isRoleOrg: false,
			oAuthId: '',
			source: '',
			roleId: [],
			roleName: [],
			inputValueChanged: false,
			roleData: [],
			btnShow: true,
			count: '',
			timer: null,
			imgUrl: '', // 图形二维码
			postPlaceholder: this.$t('点击登录按钮后获取岗位单元'),
			showOTPSlider: false,
			slideValue: 0,
			pcode: '',
			resetSlider: 0,
			disabledSlider: false,
		};
	},
	props: {
		grantChainId: String,
		loginSucessHandler: Function,
		loginPageInfo: Object,
		showPostType: String,
		toggleLoading: {
			type: Number,
			default: 0,
		},
	},
	watch: {
		toggleLoading: function (val) {
			this.loading = false;
		},
	},
	created() {
		///从父页面中获取初始化数据
	},
	computed: {
		Simple() {
			return this.$ls.get('hos_login_post_type') == 'simple' ? true : false;
		},
	},
	methods: {
		keyEnterLogin(name) {
			///键盘enter事件
			if (this.$refs[name]) {
				this.$refs[name].focus();
			} else {
				this.userHandleLogin(true);
			}
		},
		///登录操作
		otpHandleLogin(isLogin) {
			this.$refs.otpLoginForm.validate((valid) => {
				if (valid) {
					///用于处理二次认证的第一次认证的id
					this.otpLoginForm.grantChainId = this.grantChainId;
					///赋值 手机号或者邮箱的类型 phone或者mail
					this.otpLoginForm.loginType = this.loginType;
					let paramData = JSON.parse(JSON.stringify(this.otpLoginForm));
					if (this.postChainId) {
						paramData.postChainId = this.postChainId;
					}
					this.loading = true;
					useUserStore()
						.Login(paramData)
						.then((res) => {
							// 登录成功跳转
							if (res && isSuccessCode(res.code)) {
								// 获取岗位信息并展示下拉列表
								if (res.data.personId && !this.Simple) {
									this.postPlaceholder = this.$t('请选择岗位单元');
									this.personId = res.data.personId;
									this.postChainId = res.data.postChainId;
									// this.$refs.people.refresh();

									if (this.showPostType) {
										// 下拉选组件
										this.$nextTick(() => {
											this.$refs.otpLoginSelect_post.getPostPage();
										});
									} else {
										// 表格组件
										this.$nextTick(() => {
											this.$refs.otpLoginSelectTable_post.refresh();
										});
									}
									this.loading = false;
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
							this.loading = false;
							// 开启图形验证码
							if (err.code == '101-002-004-020') {
								this.openCaptcha = true;
								this.getCaptcha();
							}
							const errCode = String(err?.code ?? '');
							if (!errCode.includes('101-002-005-')) {
								ElMessage.error(err?.msg ?? this.$t('登录失败'));
							}
							if (errCode.includes(AuthConstant.forcedJumpSetPassword)) {
								this.$emit('forcedJumpSetPassword', err);
							}
						});
					// this.loading = false;
				} else {
					console.log('error submit!!');
					return false;
				}
			});
		},
		getCode() {
			if (!this.btnShow) {
				return;
			}
			this.otpLoginRules.smsCode = {
				required: false,
				trigger: 'blur',
				message: '',
			};
			this.$refs.otpLoginForm.validate((valid) => {
				if (valid) {
					this.getOTPCode();
				}
			});
			this.otpLoginRules.smsCode = {
				required: true,
				trigger: 'blur',
				message: this.$t('验证码不能为空'),
			};
		},
		countDown(timeLength) {
			let TIME_COUNT = timeLength;
			if (!this.timer) {
				this.count = TIME_COUNT;
				this.btnShow = false;
				this.timer = setInterval(() => {
					if (this.count > 0 && this.count <= TIME_COUNT) {
						this.count--;
					} else {
						this.btnShow = true;
						clearInterval(this.timer);
						this.timer = null;
					}
				}, 1000);
			}
		},
		getCertCode() {
			const cert = cryptUtil.crypt(this.otpLoginForm.loginName);
			return `${generateRandomString(10)}${cert}${generateRandomString(10)}`;
		},
		getOTPCode(token) {
			const phoneForm = token
				? { code: this.getCertCode(), token }
				: {
						phoneNumber: this.otpLoginForm.loginName,
						smsType: 'templateCode',
					};
			return fetchOTPCode(phoneForm)
				.then((response) => {
					if (response && isSuccessCode(response.code)) {
						this.otpLoginForm.smsId = response.data?.uuid;
						if (!token) {
							this.countDown(60);
						}
					} else {
						this.btnShow = true;
						clearInterval(this.timer);
						this.timer = null;
						ElMessage.error(
							response?.msg ?? this.$t('获取验证码失败，请重新再试！'),
						);
					}
				})
				.catch((error) => {
					this.btnShow = true;
					clearInterval(this.timer);
					this.timer = null;
					ElMessage.error(
						error?.msg ?? this.$t('获取验证码失败，请重新再试！'),
					);
					console.log(error);
				});
		},
		openSlider() {
			if (!this.btnShow) return;
			if (!this.otpLoginForm.loginName?.trim()) return;
			this.disabledSlider = false;
			this.pcode = cryptUtil.crypt(this.otpLoginForm.loginName);
			this.showOTPSlider = true;
		},
		onSuccess(val) {
			this.btnShow = false;
			this.showOTPSlider = false;
			this.disabledSlider = true;
			this.getOTPCode(val);
		},
		closeDialog() {
			this.showOTPSlider = false;
			this.btnShow = true;
		},
		// 获取图形二维码
		getCaptcha() {
			fetchCaptcha()
				.then((response) => {
					if (response && isSuccessCode(response.code)) {
						this.imgUrl = 'data:image/gif;base64,' + response.data.img;
						this.otpLoginForm.captchaUUID = response.data.uuid;
						this.$forceUpdate();
					} else {
						///提示错误信息
						this.$message.error(this.$t('获取验证码失败，请重新再试！'));
					}
				})
				.catch((error) => {
					console.log(error);
				});
		},
		// 忘记密码
		handleForgetPass() {
			openHosBizDialog({
				component: forgetPassword,
				_uid: 'forgetPassDialog',
				ref: 'forgetPassDialog',
				props: {},
			});
		},
		changeLoginName() {
			this.resetSlider = Date.now();
			this.reset();
		},
		reset() {
			this.postPlaceholder = this.$t('点击登录按钮后获取岗位单元');
			this.personId = '';
			this.postChainId = '';
			this.otpLoginForm.post = '';
			if (this.$refs.otpLoginSelect_post)
				this.$refs.otpLoginSelect_post.clear();
			if (this.$refs.otpLoginSelectTable_post)
				this.$refs.otpLoginSelectTable_post.clear();
		},
		changePost(id, post) {
			this.otpLoginForm.post = post;
		},
		openLoginBtn() {
			this.loading = false;
		},
	},
};
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
