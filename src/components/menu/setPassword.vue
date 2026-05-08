<template>
	<div
		@click.stop="flagHide()"
		class="change-pass"
		:class="personUuid ? 'setWidth' : ''"
	>
		<div class="force-setpassword-tip">
			<i class="hos-icom-tip-blue"></i>
			{{ msg }}
		</div>
		<hos-card>
			<hos-form
				ref="passwordForm"
				:model="passwordForm"
				:rules="rules"
				label-width="auto"
			>
				<hos-row v-if="isError">
					<hos-col>
						<hos-alert
							center
							:title="policyErrorDesc"
							type="warning"
							:closable="false"
							show-icon
							:close-text="$t('重新登录')"
							@close="logout"
						>
						</hos-alert>
					</hos-col>
				</hos-row>
				<hos-row>
					<hos-col>
						<hos-form-item :label="$t('原密码')">
							<hos-input
								:type="flag ? 'text' : 'password'"
								v-model="passwordForm.oldPassword"
							>
								<i
									class="iconPos"
									slot="suffix"
									:class="['hos-icon-view']"
									autocomplete="auto"
									@click.stop="flag = !flag"
								/>
							</hos-input>
						</hos-form-item>
					</hos-col>
				</hos-row>
				<hos-row>
					<hos-col>
						<hos-form-item :label="$t('新密码')" prop="newPasswordOne">
							<hos-input
								:type="flag1 ? 'text' : 'password'"
								v-model="passwordForm.newPasswordOne"
								><i
									slot="suffix"
									class="iconPos"
									:class="['hos-icon-view']"
									autocomplete="auto"
									@click.stop="flag1 = !flag1"
								/>
							</hos-input>
							<span v-if="showPwdStr" class="lengthStrClass"
								>({{ this.lengthStr }})</span
							>
						</hos-form-item>
					</hos-col>
				</hos-row>
				<hos-row>
					<hos-col>
						<hos-form-item :label="$t('密码强度')">
							<hos-progress
								:percentage="percentage"
								:color="customColorMethod"
								:format="percentageFormat"
								style="line-height: 22px"
							>
							</hos-progress>
						</hos-form-item>
					</hos-col>
				</hos-row>
				<hos-row>
					<hos-col>
						<hos-form-item :label="$t('确认密码')" prop="newPasswordTwo">
							<hos-input
								:type="flag2 ? 'text' : 'password'"
								v-model="passwordForm.newPasswordTwo"
							>
								<i
									slot="suffix"
									class="iconPos"
									:class="['hos-icon-view']"
									autocomplete="auto"
									@click.stop="flag2 = !flag2"
								/>
							</hos-input>
						</hos-form-item>
					</hos-col>
				</hos-row>
			</hos-form>
		</hos-card>
		<div slot="footer" class="dialog-footer">
			<hos-button type="primary" @click="cancel()">{{ $t('取消') }}</hos-button>
			<hos-button type="success" @click="save()">{{ $t('保存') }}</hos-button>
			<!-- v-if="showLastBtn" -->
			<hos-button @click="useLastPwd()" type="warning" v-if="isPasswordExpires">
				{{ $t('延用密码') }}</hos-button
			>
		</div>
	</div>
</template>
<script>
import AuthConstant from '@/constant/auth-constant';
import { getLocale } from '@/utils/i18n/i18n-util';
import { useUserStore } from '@/stores/user';

export default {
	props: ['personUuid', 'code', 'msg', 'callback'],
	data() {
		return {
			menuLabel: {
				fiexdPass: this.$t('固定密码'),
				IDcard: this.$t('身份证'),
				noLimit: this.$t('不限制'),
				numberLetter: this.$t('数字、字母'),
				numberUpLower: this.$t('数字、小写字母、大写字母'),
				numberLetterChar: this.$t('数字、字母、特殊字符组合'),
				numberUpLowerChar: this.$t('数字、小写字母、大写字母、特殊字符组合'),
			},
			// 判断来源如果来自登录页面 设置宽度并居中  保存密码或沿用密码时携带
			// personUuid:this.$route.query.personUuid,
			// code:this.$route.query.code,
			// rowNum: 18,
			// offsetNum: 3,
			isPasswordExpires: false,
			flag: false,
			flag1: false,
			flag2: false,
			// 是否显示沿用密码按钮
			showLastBtn: false,
			lengthStr: '',
			showPwdStr: false,
			// 密码策略
			pwdPolicy: {},
			// 修改密码的表单
			passwordForm: {
				oldPassword: '',
				newPasswordOne: '',
				newPasswordTwo: '',
			},
			// 密码评分
			percentage: 0,
			isError: false,
			policyErrorDesc: '',
			redirectUrl: this.$route.query.redirectUrl,
			rules: {
				oldPassword: [
					{
						required: true,
						trigger: 'blur',
						validator: (rule, value, callback) => {
							if (value && value != '') {
								// 不存在uuid说明是普通修改密码
								if (!this.personUuid) {
									this.$api('sys-password.validateOldPassword1', {
										oldPassword: this.$m.crypt(value),
										personUuid: null,
									}).then((res) => {
										if (res && res.code == 200 && res.data == true) {
											callback();
										} else {
											callback(new Error(res.msg));
										}
									});
								} else {
									// 存在uuid说明是强制修改密码
									this.$api('sys-password.validateOldPassword2', {
										oldPassword: this.$m.crypt(value),
										personUuid: this.personUuid,
									}).then((res) => {
										if (res && res.code == 200 && res.data == true) {
											callback();
										} else {
											callback(new Error(res.msg));
										}
									});
								}
							} else {
								callback(new Error(this.$t('请输入原密码')));
							}
						},
					},
				],
				newPasswordOne: [
					{
						required: true,
						trigger: 'blur',
						validator: (rule, value, callback) => {
							if (value && value !== '') {
								if (value.length < this.pwdPolicy.minSize) {
									callback(new Error(this.$t('新密码长度不符合密码策略要求')));
								} else {
									if (
										this.pwdPolicy.complexity &&
										this.pwdPolicy.complexity.indexOf('number') != -1
									) {
										var val = /\d+/;
										if (!val.test(value)) {
											callback(
												new Error(this.$t('新密码不符合密码复杂度要求'))
											);
										}
									}

									if (
										this.pwdPolicy.complexity &&
										this.pwdPolicy.complexity.indexOf('letter') != -1
									) {
										var val = /[a-zA-Z]+/;
										if (!val.test(value)) {
											callback(
												new Error(this.$t('新密码不符合密码复杂度要求'))
											);
										}
									}

									if (
										this.pwdPolicy.complexity &&
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
										this.pwdPolicy.complexity &&
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
										this.pwdPolicy.complexity &&
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
				newPasswordTwo: [
					{
						required: true,
						trigger: 'blur',
						validator: (rule, value, callback) => {
							if (value && value != '') {
								if (value == this.passwordForm.newPasswordOne) {
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
			tmpLocale: '',
		};
	},
	watch: {
		'passwordForm.newPasswordOne': {
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
	created() {
		if (document.querySelector('.login-loading-mask'))
			document.querySelector('.login-loading-mask').style.display = 'none';

		this.tmpLocale = getLocale();
		//代表强制修改密码的页面，
		// if(this.$route.fullPath=="/password"){
		//     this.rowNum = 14;
		//     this.offsetNum = 5;
		// }
		// 获取需要展示在alert里的文字信息
		let policyErrorCode = this.$store.getters.policyErrorCode;
		///
		if (policyErrorCode && AuthConstant.passwordError[policyErrorCode]) {
			this.isError = true;
			this.policyErrorDesc = AuthConstant.passwordError[policyErrorCode];
		}
		// 判断是否为密码过期，过期开启沿用密码按钮
		if (this.code === '101-002-005-003') {
			this.isPasswordExpires = true;
		}

		let personUuid = '';
		if (this.personUuid) {
			personUuid = this.personUuid;
		}

		if (personUuid == '' || personUuid == null) {
			this.$api('sys-password.getPwdPolicy').then((res) => {
				if (res && res.code == 200) {
					this.pwdPolicy = res.data;
					// 控制是否显示密码策略内容
					// if (
					//     (this.pwdPolicy.minSize == "" || this.pwdPolicy.minSize == "0") &&
					//     this.pwdPolicy.complexity
					// ) {
					if (this.pwdPolicy.minSize || this.pwdPolicy.complexity) {
						this.showPwdStr = true;
					} else {
						this.showPwdStr = false;
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
			});
		} else {
			this.$api('sys-password.ForcinggetPwdPolicy').then((res) => {
				if (res && res.code == 200) {
					this.pwdPolicy = res.data;
					// 控制是否显示密码策略内容
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
			});
		}
	},
	methods: {
		logout() {
			useUserStore()
				.Logout()
				.then(() => {
					this.callback();
				});
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
		flagHide() {
			this.flag = this.flag1 = this.flag2 = false;
		},
		flagShow(e) {
			this.flag = !this.flag;
			e.stopPropagation();
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
		// 沿用密码
		useLastPwd() {
			this.$api('sys-password.useLastPwd', {
				personUuid: this.personUuid,
			}).then((res) => {
				if (res && res.code == 200) {
					this.showLastBtn = false;
					this.cancel();
					this.$message.success(this.$t('延用上次密码成功'));
				} else {
					this.showLastBtn = true;
					this.$message.error(this.$t('延用上次密码失败'));
				}
			});
		},
		cancel() {
			////代表强制修改密码的页面，
			// debugger
			// if (this.personUuid) {
			this.logout();
			// } else {
			////弹出层 内部打开的

			this.$store.commit('CLOSE_DIALOG', { _uid: 'forcedJumpSetPassword' });
			this.$store.commit('CLOSE_DIALOG', { _uid: 'setPassword' });
			window.parent.postMessage('cancel', '*');
			// }
		},
		save() {
			let pwdForm = {
				oldPassword: this.$m.crypt(this.passwordForm.oldPassword),
				newPassword: this.$m.crypt(this.passwordForm.newPasswordOne),
				rePassword: this.$m.crypt(this.passwordForm.newPasswordTwo),
				personUuid: this.personUuid,
				type: 'form',
			};
			this.$refs.passwordForm.validate((valid) => {
				if (valid) {
					this.$api('sys-password.changePassword', pwdForm).then((res) => {
						if (res && res.code == 200) {
							this.$message.success(this.$t(res.msg));
							this.cancel();
							this.callback();
							this.$store.commit('CLOSE_DIALOG', { _uid: 'setPassword' });
							window.parent.postMessage('cancel', '*');
						} else {
							this.$message.error(res.msg);
						}
					});
				}
			});
		},
	},
};
</script>
<style scoped lang="scss">
.change-pass::v-deep .hos-form-item {
	margin-bottom: 20px;
}
.change-pass .hos-form {
	width: 460px;
	padding: 0 15px;
	margin: auto;
}
.change-pass .dialog-footer {
	text-align: center;
	padding-bottom: 15px;
	.hos-button + .hos-button {
		margin-left: 80px;
	}
}
.change-pass::v-deep .hos-input__suffix {
	right: 10px;
}
.setWidth {
	padding: 15px;
	padding-top: 0;
	// width: 600px;
	// margin:0 auto;
	// margin-top: 40px;
}
.force-setpassword-tip {
	box-sizing: border-box;
	width: 640px;
	height: 32px;
	padding: 8px 15px;
	margin-bottom: 15px;
	font-size: 14px;
	line-height: 1;
	color: rgba(71, 129, 243, 1);
	background: #e8effd;
	border: 1px solid;
	border-color: #4781f3;
	border-radius: 5px;
}
</style>
