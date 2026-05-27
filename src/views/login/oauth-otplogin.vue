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
						ref="otpLoginForm"
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
<script>
import AuthConstant from '@/constant/auth-constant';
import { getLoginErrorDesc } from './js/login';
import { validPhone11, validEmail } from '@/utils/validateUtil';
import { useUserStore } from '@/stores/user';
import { closeHosBizDialog } from '@/composables/useHosBiz';
import { getOTPCode as fetchOTPCode } from '@/api/login';
export default {
	props: {
		// 登录成功的回调
		loginSucessHandler: {
			type: Function,
			default: () => {},
		},
		// 是否是二次登录
		againLogin: {
			type: Boolean,
			default: false,
		},
		// 二次认证需要传参的UUID
		grantChainId: {
			type: String,
			default: '',
		},
		// 手机号
		phoneDisplay: {
			type: String,
			default: '',
		},
		// 手机号id
		grantChainId: {
			type: String,
			default: '',
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
				callback();
			}
		};
		return {
			otpForm: {
				loginName: '',
				grantChainId: '',
				smsCode: '',
				smsId: '',
			},
			otpLoginRules: {
				loginName: [{ validator: validatePhoneAndMail, trigger: 'blur' }],
				///口令不能为空
				smsCode: [
					{
						required: true,
						trigger: 'blur',
						message: this.$t('验证码不能为空'),
					},
				],
			},
			btnShow: true,
			count: '',
		};
	},
	created() {
		this.otpForm.loginName = this.phoneDisplay;
		this.otpForm.grantChainId = this.grantChainId;
	},
	methods: {
		// 关闭弹框
		close() {
			// this.$store.commit('CLOSE_DIALOG',{_uid:'SCDialog'});
			closeHosBizDialog({ _uid: 'CADialog' });
		},
		// 登录流程  所有登录形式最后都走到登录流程来
		otpLogin() {
			let upData = {
				againLogin: this.againLogin, // 是否为二次认证
				grantChainId: this.grantChainId, // 当前手机号的id
				smsId: this.otpForm.smsId, // 请求验证码时返回的id
				smsCode: this.otpForm.smsCode, // 输入的验证码
				loginName: this.phoneDisplay, // 手机号
				grantType: 'sms', // 登录方式
				loginType: 'phone',
			};
			useUserStore().Login(upData)
				.then((res) => {
					if (res && res.code == 200) {
						this.loginSucessHandler();
					} else {
						this.$message.error(res.msg);
						closeHosBizDialog({});
					}
				})
				.catch((err) => {
					let code = err.code;
					///需要双因子认证的错误， 为什么又一次弹出了二次认证弹框
					if (code === AuthConstant.twoAuthErrorCode) {
						///这个需要从respnmse中获取数据,已经从过滤器中处理了
						let grantChainId = err.data.grantChainId;
						let authType = err.data.againAuthType;
						let account = err.data.accountCode;
						///弹出层
						this.$emit('openTwoAuthDialog', grantChainId, authType, account);
					} else {
						///根据返回的编码，从国家化中获取相应的描述
						////公共的错误码的校验
						let errorDesc = getLoginErrorDesc(code, err.msg);
						if (!errorDesc || errorDesc == '') {
							errorDesc = this.$t('短信登录失败，请重新再试！');
						}
						this.$message.error(err.msg);
						// this.$store.commit('CLOSE_DIALOG')
					}
				});
		},
		getCode() {
			if (!this.btnShow) {
				return;
			}
			this.$refs.otpLoginForm.validateField('loginName', (valid) => {
				if (valid == '') {
					this.getOTPCode();
				}
			});
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
		getOTPCode() {
			fetchOTPCode({
				phoneNumber: this.otpForm.loginName,
				smsType: 'templateCode',
			})
				.then((response) => {
					if (response && response.code == 200) {
						this.otpForm.smsId = response.data.uuid;
						this.countDown(60);
					} else {
						///提示错误信息
						this.$message.error(response.msg);
					}
				})
				.catch((error) => {
					this.$message.error(error.msg);
					console.log(error);
				});
		},
	},
};
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
