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
								<el-icon class="iconPos" @click.stop="flag1 = !flag1">
									<View />
								</el-icon>
							</template>
						</el-input>
						<span v-if="showPwdStr" class="lengthStrClass"
							>({{ lengthStr }})</span
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
								<el-icon class="iconPos" @click.stop="flag2 = !flag2">
									<View />
								</el-icon>
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

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { getLocale } from '@/utils/i18n/i18n-util';
import { closeHosBizDialog } from '@/composables/useHosBiz';
import { crypt } from '@/composables/useCrypt';
import { getOTPCode, getCaptcha as fetchCaptcha } from '@/api/login';
import {
	validateForgetCode,
	editForgetPassword,
	fetchForgetPhone,
} from '@/api/forget-password';
import { fetchForcingPwdPolicy } from '@/api/sys-password';
import { View } from '@element-plus/icons-vue';

const { t } = useI18n();

const firstFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

const loading = ref(false);
const active = ref(0);
const showFirst = ref(true);
const showSecond = ref(false);
const showThird = ref(false);
const firstForm = reactive<Record<string, unknown>>({});
const imgCodeUrl = ref('');
const passwordForm = reactive<Record<string, unknown>>({});
const flag1 = ref(false);
const flag2 = ref(false);
const pwdPolicy = reactive<Record<string, unknown>>({});
const showPwdStr = ref(false);
const lengthStr = ref('');
const percentage = ref(0);
const showCode = ref(true);
const waitTime = ref(60);
const notCn = ref(false);
const code = ref('');
const maskCode = ref('');
const showLastBtn = ref(false);

const firstFormRules = reactive<FormRules>({
	phoneNumber: [
		{
			required: true,
			message: t('请输入手机号'),
			trigger: 'blur',
		},
		{
			pattern:
				/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
			message: t('请输入正确的手机号码'),
		},
	],
	smsCode: [
		{
			required: true,
			message: t('请输入验证码'),
			trigger: 'blur',
		},
	],
	captchaCode: [
		{
			required: true,
			message: t('请输入图形验证码'),
			trigger: 'blur',
		},
	],
});

const passwordFormRules = reactive<FormRules>({
	newPassword: [
		{
			required: true,
			trigger: 'blur',
			validator: (rule, value, callback) => {
				if (value && value !== '') {
					const minSize = Number(pwdPolicy.minSize ?? 0);
					if (value.length < minSize) {
						callback(new Error(t('新密码长度不符合密码策略要求')));
					} else {
						const complexity = String(pwdPolicy.complexity ?? '');
						if (complexity.indexOf('number') != -1) {
							const val = /\d+/;
							if (!val.test(value)) {
								callback(new Error(t('新密码不符合密码复杂度要求')));
							}
						}

						if (complexity.indexOf('letter') != -1) {
							const val = /[a-zA-Z]+/;
							if (!val.test(value)) {
								callback(new Error(t('新密码不符合密码复杂度要求')));
							}
						}

						if (complexity.indexOf('lowercaseLetter') != -1) {
							const val = /[a-z]+/;
							if (!val.test(value)) {
								callback(new Error(t('新密码不符合密码复杂度要求')));
							}
						}

						if (complexity.indexOf('capitalLetter') != -1) {
							const val = /[A-Z]+/;
							if (!val.test(value)) {
								callback(new Error(t('新密码不符合密码复杂度要求')));
							}
						}

						if (complexity.indexOf('pecialCharacters') != -1) {
							const val = /((?=[\x21-\x7e]+)[^A-Za-z0-9])/;
							if (!val.test(value)) {
								callback(new Error(t('新密码不符合密码复杂度要求')));
							}
						}

						callback();
					}
				} else {
					callback(new Error(t('请输入新密码')));
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
					if (value == passwordForm.newPassword) {
						callback();
					} else {
						callback(new Error(t('两次输入的密码不一致')));
					}
				} else {
					callback(new Error(t('请再次输入新密码')));
				}
			},
		},
	],
});

onMounted(() => {
	getCaptcha();
	getPwdPolicy();
	notCn.value = getLocale() == 'zh' ? false : true;
});

watch(
	() => passwordForm.newPassword,
	(newValue) => {
		const val = String(newValue ?? '');
		let mark = 0;
		if (val.length < 5) {
			mark += 5;
		} else if (val.length >= 8) {
			mark += 25;
		} else {
			mark += 10;
		}
		if (/[A-Za-z]/.test(val)) {
			if (/[A-Z]/.test(val) && /[a-z]/.test(val)) {
				mark += 20;
			} else {
				mark += 10;
			}
		}
		const countNum = val.length - val.replace(/\d+/g, '').length;
		if (countNum == 1) {
			mark += 10;
		} else if (countNum > 1) {
			mark += 20;
		}
		const count =
			val.length -
			val.replace(
				/[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/g,
				''
			).length;
		if (count == 1) {
			mark += 10;
		} else if (count > 1) {
			mark += 25;
		}
		if (/[A-Za-z]/.test(val) && /\d/g.test(val)) {
			mark += 2;
			if (
				/[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/.test(
					val
				)
			) {
				mark += 1;
				if (/[A-Z]/.test(val) && /[a-z]/.test(val)) {
					mark += 2;
				}
			}
		}
		percentage.value = mark;
	}
);

function firstNextStep() {
	firstFormRef.value?.validate(async (valid) => {
		if (valid) {
			const obj = JSON.parse(JSON.stringify(firstForm));
			const { code: resCode, data, msg } = await validateForgetCode(obj);
			if (resCode == 200) {
				active.value++;
				showFirst.value = false;
				showSecond.value = true;
				passwordForm.personUuid = data;
			} else {
				ElMessage.error(msg);
			}
		}
	});
}

function secondNextStep() {
	passwordFormRef.value?.validate(async (valid) => {
		if (valid) {
			const obj = JSON.parse(JSON.stringify(passwordForm));
			if (obj.newPassword) {
				obj.newPassword = crypt(obj.newPassword);
			}
			if (obj.rePassword) {
				obj.rePassword = crypt(obj.rePassword);
			}
			const { code: resCode, msg } = await editForgetPassword(obj);
			if (resCode == 200) {
				active.value++;
				showSecond.value = false;
				showThird.value = true;
			} else {
				ElMessage.error(msg);
			}
		}
	});
}

async function getPwdPolicy() {
	const { code, data } = await fetchForcingPwdPolicy();
	if (code == 200) {
		Object.assign(pwdPolicy, data);
		if (
			(pwdPolicy.minSize == '' || pwdPolicy.minSize == '0') &&
			pwdPolicy.complexity == ''
		) {
			showPwdStr.value = false;
		} else {
			showPwdStr.value = true;
		}
		if (pwdPolicy.minSize && Number(pwdPolicy.minSize) > 0) {
			lengthStr.value = t('密码最小长度为') + pwdPolicy.minSize + '，';
		}
		if (pwdPolicy.complexity) {
			let pass = '';
			switch (pwdPolicy.complexity) {
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
			lengthStr.value += t('密码中至少包含') + t(pass) + '，';
		}
		if (pwdPolicy.keepPas == 'true' && policyErrorCode == '003') {
			showLastBtn.value = true;
		}
		if (lengthStr.value.length > 0) {
			lengthStr.value = lengthStr.value.substring(
				0,
				lengthStr.value.length - 1
			);
		}
	}
}

async function handleCode() {
	if (firstForm.phoneNumber) {
		const { code: resCode, data, msg } = await getOTPCode({
			phoneNumber: firstForm.phoneNumber,
			smsType: 'forgotPasswordTemplateCode',
		});
		if (resCode == '200') {
			firstForm.smsId = (data as { uuid?: string })?.uuid ?? ''
			showCode.value = false;
			const timer = setInterval(() => {
				if (waitTime.value > 1) {
					waitTime.value--;
				} else {
					clearInterval(timer);
					showCode.value = true;
					waitTime.value = 60;
				}
			}, 1000);
		} else {
			ElMessage.error(msg);
		}
	} else {
		ElMessage.info(t('请输入手机号'));
	}
}

function customColorMethod(percentageVal: number) {
	if (percentageVal < 30) {
		return '#ff0000';
	} else if (percentageVal >= 30 && percentageVal < 50) {
		return '#ff5500';
	} else if (percentageVal >= 50 && percentageVal < 70) {
		return '#ffaa00';
	} else if (percentageVal >= 70 && percentageVal < 90) {
		return '#ffaa7f';
	} else if (percentageVal >= 90) {
		return '#67c23a';
	}
}

function percentageFormat(percentageVal: number) {
	let formatResult = '';
	if (percentageVal >= 90) {
		formatResult = t('非常安全');
	} else if (percentageVal >= 80 && percentageVal < 90) {
		formatResult = t('安全');
	} else if (percentageVal >= 70 && percentageVal < 80) {
		formatResult = t('非常强');
	} else if (percentageVal >= 60 && percentageVal < 70) {
		formatResult = t('强');
	} else if (percentageVal >= 50 && percentageVal < 60) {
		formatResult = t('一般');
	} else if (percentageVal >= 25 && percentageVal < 50) {
		formatResult = t('弱');
	} else if (percentageVal >= 0 && percentageVal < 25) {
		formatResult = t('非常弱');
	}
	return formatResult;
}

async function getCaptcha() {
	const { code, data } = await fetchCaptcha()
	const payload = (data ?? {}) as { img?: string; uuid?: string }
	if (code == 200) {
		imgCodeUrl.value = 'data:image/gif;base64,' + (payload.img ?? '')
		firstForm.captchaUUID = payload.uuid ?? ''
	} else {
		ElMessage.error(t('获取验证码失败，请重新再试！'));
	}
}

function cancel() {
	closeHosBizDialog({
		_uid: 'forgetPassDialog',
	});
}

function getPhone(val: string) {
	fetchForgetPhone(val)
		.then((res) => {
			if (res.code == 200) {
				const phone = String(res.data ?? '')
				firstForm.phoneNumber = phone
				maskCode.value = `${phone.substring(0, 3)}****${phone.substring(7)}`
			} else {
				ElMessage.error(res.msg);
			}
		})
		.catch((e: { msg?: string }) => {
			ElMessage.error(e.msg);
		});
}

declare const policyErrorCode: string | undefined;
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

	:deep(.el-progress) {
		// width: 95%;
		// line-height: 22px;
		.el-progress-bar__outer {
			// height: 22px !important;
		}
	}
}
</style>
