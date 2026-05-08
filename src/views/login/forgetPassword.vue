<template>
	<div :loading="loading" class="forget-pass">
		<div class="card-style" style="padding-top: 40px">
			<div>
				<el-steps :active="active" align-center>
					<el-step :title="$t('短信校验')"></el-step>
					<el-step :title="$t('设置新密码')"></el-step>
					<el-step :title="$t('完成')"></el-step>
				</el-steps>
			</div>
		</div>
		<!-- <el-divider></el-divider> -->
		<div class="card-style">
			<div v-show="showFirst">
				<!-- 短信校验 -->
				<el-form :model="firstForm" :rules="firstFormRules" ref="firstFormRef">
					<!-- 工号 -->
					<el-form-item>
						<el-input
							v-model="code"
							:placeholder="$t('请输入工号')"
							@change="getPhone"
						></el-input>
					</el-form-item>
					<!-- 手机号 -->
					<el-form-item>
						<el-input
							v-model="maskCode"
							:placeholder="$t('根据工号获取手机号')"
							disabled
						></el-input>
					</el-form-item>
					<!-- 验证码 -->
					<el-form-item prop="smsCode">
						<el-input
							v-model="firstForm.smsCode"
							:placeholder="$t('请输入验证码')"
						>
						</el-input>
						<a @click="handleCode" class="get-code-style" v-if="showCode">{{
							$t('获取验证码')
						}}</a>
						<span class="span-code" v-else
							>{{ waitTime }}{{ $t('秒后重新获取') }}</span
						>
					</el-form-item>
					<!-- 图形验证码 -->
					<el-form-item prop="captchaCode">
						<el-row :gutter="20">
							<el-col :span="18">
								<el-input
									v-model="firstForm.captchaCode"
									:placeholder="$t('请输入图形验证码')"
								>
								</el-input>
							</el-col>
							<img style="height: 30px" :src="imgCodeUrl" @click="getCaptcha" />
						</el-row>
					</el-form-item>
				</el-form>
				<!-- 下一步 -->
				<div class="footer">
					<el-button type="success" @click="firstNextStep">{{
						$t('下一步')
					}}</el-button>
				</div>
			</div>
			<div v-show="showSecond">
				<!-- 设置新密码 -->
				<el-form
					:model="passwordForm"
					:rules="passwordFormRules"
					ref="passwordFormRef"
					label-width="auto"
				>
					<!-- 新密码 -->
					<el-form-item prop="newPassword">
						<el-input
							:type="flag1 ? 'text' : 'password'"
							v-model="passwordForm.newPassword"
							:placeholder="$t('新密码')"
						>
							<template #suffix>
								<i
									class="iconPos"
									:class="['el-icon-view']"
									autocomplete="auto"
									@click.stop="flag1 = !flag1"
								/>
							</template>
						</el-input>
						<span v-if="showPwdStr" class="lengthStrClass"
							>({{ this.lengthStr }})</span
						>
					</el-form-item>
					<!-- 密码强度 -->
					<el-form-item>
						<el-progress
							:text-inside="notCn"
							:stroke-width="notCn ? 18 : 7"
							:percentage="percentage"
							:color="customColorMethod"
							:format="percentageFormat"
							:placeholder="$t('密码强度')"
						>
						</el-progress>
					</el-form-item>
					<!-- 确认密码 -->
					<el-form-item prop="rePassword">
						<el-input
							:type="flag2 ? 'text' : 'password'"
							v-model="passwordForm.rePassword"
							:placeholder="$t('确认密码')"
						>
							<template #suffix>
								<i
									class="iconPos"
									:class="['el-icon-view']"
									autocomplete="auto"
									@click.stop="flag2 = !flag2"
								/>
							</template>
						</el-input>
					</el-form-item>
				</el-form>
				<!-- 下一步 -->
				<div class="footer">
					<el-button type="success" @click="secondNextStep">{{
						$t('下一步')
					}}</el-button>
				</div>
			</div>
			<div v-show="showThird">
				<el-result icon="success" :subTitle="$t('登录密码更新成功')">
				</el-result>
				<!-- 重新登录 -->
				<div class="footer">
					<el-button type="primary" @click="cancel">{{
						$t('重新登录')
					}}</el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { getLocale, setCurrentLocale } from '@/utils/i18n/i18n-util';
export default {
	name: 'forgetPassword',
	data() {
		return {
			loading: false,
			active: 0,
			showFirst: true,
			showSecond: false,
			showThird: false,
			firstForm: {},
			firstFormRules: {
				phoneNumber: [
					{
						required: true,
						message: this.$t('请输入手机号'),
						trigger: 'blur',
					},
					{
						pattern:
							/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
						message: this.$t('请输入正确的手机号码'),
					},
				],
				smsCode: [
					{
						required: true,
						message: this.$t('请输入验证码'),
						trigger: 'blur',
					},
				],
				captchaCode: [
					{
						required: true,
						message: this.$t('请输入图形验证码'),
						trigger: 'blur',
					},
				],
			},
			imgCodeUrl: '',
			// 设置密码
			passwordForm: {},
			passwordFormRules: {
				newPassword: [
					{
						required: true,
						trigger: 'blur',
						validator: (rule, value, callback) => {
							if (value && value !== '') {
								if (value.length < this.pwdPolicy.minSize) {
									callback(new Error(this.$t('新密码长度不符合密码策略要求')));
								} else {
									if (this.pwdPolicy.complexity.indexOf('number') != -1) {
										var val = /\d+/;
										if (!val.test(value)) {
											callback(
												new Error(this.$t('新密码不符合密码复杂度要求'))
											);
										}
									}

									if (this.pwdPolicy.complexity.indexOf('letter') != -1) {
										var val = /[a-zA-Z]+/;
										if (!val.test(value)) {
											callback(
												new Error(this.$t('新密码不符合密码复杂度要求'))
											);
										}
									}

									if (
										this.pwdPolicy.complexity.indexOf('lowercaseLetter') != -1
									) {
										var val = /[a-z]+/;
										if (!val.test(value)) {
											callback(
												new Error(this.$t('新密码不符合密码复杂度要求'))
											);
										}
									}

									if (
										this.pwdPolicy.complexity.indexOf('capitalLetter') != -1
									) {
										var val = /[A-Z]+/;
										if (!val.test(value)) {
											callback(
												new Error(this.$t('新密码不符合密码复杂度要求'))
											);
										}
									}

									if (
										this.pwdPolicy.complexity.indexOf('pecialCharacters') != -1
									) {
										var val = /((?=[\x21-\x7e]+)[^A-Za-z0-9])/;
										if (!val.test(value)) {
											callback(
												new Error(this.$t('新密码不符合密码复杂度要求'))
											);
										}
									}

									callback();
								}
							} else {
								callback(new Error(this.$t('请输入新密码')));
							}
						},
					},
				],
				rePassword: [
					{
						required: true,
						trigger: 'blur',
						validator: (rule, value, callback) => {
							if (value && value != '') {
								if (value == this.passwordForm.newPassword) {
									callback();
								} else {
									callback(new Error(this.$t('两次输入的密码不一致')));
								}
							} else {
								callback(new Error(this.$t('请再次输入新密码')));
							}
						},
					},
				],
			},
			flag1: false,
			flag2: false,
			// 密码策略
			pwdPolicy: {},
			showPwdStr: false,
			lengthStr: '',
			percentage: 0,
			showCode: true,
			waitTime: 60,
			notCn: false,
			code: '',
			maskCode: '', // 电话掩码
		};
	},
	created() {
		this.getCaptcha();
		this.getPwdPolicy();
		this.notCn = getLocale() == 'zh' ? false : true;
	},
	watch: {
		'passwordForm.newPassword': {
			handler(newValue) {
				var mark = 0;
				// 长度得分
				if (newValue.length < 5) {
					mark += 5;
				} else if (newValue.length >= 8) {
					mark += 25;
				} else {
					mark += 10;
				}
				// 含字母得分
				if (/[A-Za-z]/.test(newValue)) {
					if (/[A-Z]/.test(newValue) && /[a-z]/.test(newValue)) {
						// 大小写字母混合
						mark += 20;
					} else {
						// 只有大写或小写
						mark += 10;
					}
				}
				// 含数字得分
				var countNum = newValue.length - newValue.replace(/\d+/g, '').length;
				if (countNum == 1) {
					mark += 10;
				} else if (countNum > 1) {
					mark += 20;
				}
				// 含特殊符号得分
				var count =
					newValue.length -
					newValue.replace(
						/[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/g,
						''
					).length;
				if (count == 1) {
					mark += 10;
				} else if (count > 1) {
					mark += 25;
				}
				// 组合
				if (/[A-Za-z]/.test(newValue) && /\d/g.test(newValue)) {
					mark += 2;
					if (
						/[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/.test(
							newValue
						)
					) {
						mark += 1;
						if (/[A-Z]/.test(newValue) && /[a-z]/.test(newValue)) {
							mark += 2;
						}
					}
				}
				this.percentage = mark;
			},
		},
	},
	methods: {
		firstNextStep() {
			this.$refs['firstFormRef'].validate(async (valid) => {
				if (valid) {
					const obj = JSON.parse(JSON.stringify(this.firstForm));
					const { code, data, msg } = await this.$api(
						'forget-password.validateForgetCode',
						obj
					);
					if (code == 200) {
						this.active++;
						this.showFirst = false;
						this.showSecond = true;
						this.passwordForm.personUuid = data;
					} else {
						this.$message.error(msg);
					}
				}
			});
		},
		secondNextStep() {
			this.$refs['passwordFormRef'].validate(async (valid) => {
				if (valid) {
					const obj = JSON.parse(JSON.stringify(this.passwordForm));
					if (obj.newPassword) {
						obj.newPassword = this.$m.crypt(obj.newPassword);
					}
					if (obj.rePassword) {
						obj.rePassword = this.$m.crypt(obj.rePassword);
					}
					const { code, msg } = await this.$api(
						'forget-password.editPass',
						obj
					);
					if (code == 200) {
						this.active++;
						this.showSecond = false;
						this.showThird = true;
					} else {
						this.$message.error(msg);
					}
				}
			});
		},
		async getPwdPolicy() {
			const { code, data } = await this.$api(
				'sys-password.ForcinggetPwdPolicy'
			);
			if (code == 200) {
				this.pwdPolicy = data;
				if (
					(this.pwdPolicy.minSize == '' || this.pwdPolicy.minSize == '0') &&
					this.pwdPolicy.complexity == ''
				) {
					this.showPwdStr = false;
				} else {
					this.showPwdStr = true;
				}
				if (this.pwdPolicy.minSize && this.pwdPolicy.minSize > 0) {
					this.lengthStr =
						this.$t('密码最小长度为') + this.pwdPolicy.minSize + '，';
				}
				if (this.pwdPolicy.complexity) {
					let pass = '';
					switch (this.pwdPolicy.complexity) {
						case 'number,letter':
							pass = '数字、字母';
							break;
						case 'number,lowercaseLetter,capitalLetter':
							pass = '数字、小写字母、大写字母';
							break;
						case 'number,letter,pecialCharacters':
							pass = '数字、字母、特殊字符组合';
							break;
						case 'number,lowercaseLetter,capitalLetter,pecialCharacters':
							pass = '数字、小写字母、大写字母、特殊字符组合';
							break;
					}
					this.lengthStr += this.$t('密码中至少包含') + this.$t(pass) + '，';
				}
				if (this.pwdPolicy.keepPas == 'true' && policyErrorCode == '003') {
					this.showLastBtn = true;
				}
				if (this.lengthStr.length > 0) {
					this.lengthStr = this.lengthStr.substring(
						0,
						this.lengthStr.length - 1
					);
				}
			}
		},
		// 获取验证码
		async handleCode() {
			if (this.firstForm.phoneNumber) {
				const { code, data, msg } = await this.$api('getOTPCode', {
					phoneNumber: this.firstForm.phoneNumber,
					smsType: 'forgotPasswordTemplateCode',
				});
				if (code == '200') {
					this.firstForm.smsId = data.uuid;
					this.showCode = false;
					let timer = setInterval(() => {
						if (this.waitTime > 1) {
							this.waitTime--;
						} else {
							clearInterval(timer);
							this.showCode = true;
							this.waitTime = 60;
						}
					}, 1000);
				} else {
					this.$message.error(msg);
				}
			} else {
				this.$message.info(this.$t('请输入手机号'));
			}
		},
		customColorMethod(percentage) {
			if (percentage < 30) {
				return '#ff0000';
			} else if (percentage >= 30 && percentage < 50) {
				return '#ff5500';
			} else if (percentage >= 50 && percentage < 70) {
				return '#ffaa00';
			} else if (percentage >= 70 && percentage < 90) {
				return '#ffaa7f';
			} else if (percentage >= 90) {
				return '#67c23a';
			}
		},
		percentageFormat(percentage) {
			var formatResult = '';
			if (percentage >= 90) {
				formatResult = this.$t('非常安全');
			} else if (percentage >= 80 && percentage < 90) {
				formatResult = this.$t('安全');
			} else if (percentage >= 70 && percentage < 80) {
				formatResult = this.$t('非常强');
			} else if (percentage >= 60 && percentage < 70) {
				formatResult = this.$t('强');
			} else if (percentage >= 50 && percentage < 60) {
				formatResult = this.$t('一般');
			} else if (percentage >= 25 && percentage < 50) {
				formatResult = this.$t('弱');
			} else if (percentage >= 0 && percentage < 25) {
				formatResult = this.$t('非常弱');
			}
			return formatResult;
		},
		async getCaptcha() {
			const { code, data } = await this.$api('getCaptcha');
			if (code == 200) {
				this.imgCodeUrl = 'data:image/gif;base64,' + data.img;
				this.firstForm.captchaUUID = data.uuid;
			} else {
				this.$message.error(this.$t('获取验证码失败，请重新再试！'));
			}
		},
		cancel() {
			this.$store.commit('CLOSE_DIALOG', {
				_uid: 'forgetPassDialog',
			});
		},
		getPhone(val) {
			this.$api('forget-password.getPhone', { loginName: val })
				.then((res) => {
					if (res.code == 200) {
						this.firstForm.phoneNumber = res.data;
						this.maskCode = `${res.data.substring(0, 3)}****${res.data.substring(7)}`;
					} else {
						this.$message.error(res.msg);
					}
				})
				.catch((e) => {
					this.$message.error(e.msg);
				});
		},
	},
};
</script>
<style scoped lang="scss">
.forget-pass {
	padding-bottom: 20px;
	padding-left: 15px;
	padding-right: 15px;

	.card-style:last-child {
		margin-bottom: 0;
	}

	.mt25 {
		margin-top: 25px;
	}

	.get-code-style {
		position: absolute;
		right: 10px;
		color: #4781f3;
		cursor: pointer;
	}

	.span-code {
		position: absolute;
		right: 10px;
	}

	.footer {
		text-align: center;
		padding: 10px 0 20px;
	}

	.iconPos {
		padding-right: 10px;
	}

	::v-deep .el-progress {
		// width: 95%;
		// line-height: 22px;
		.el-progress-bar__outer {
			// height: 22px !important;
		}
	}
}
</style>
