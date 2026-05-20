<template>
	<div
		class="change-pass"
		:class="{ setWidth: !!personUuid }"
		@click.stop="flagHide"
	>
		<div class="force-setpassword-tip">
			<el-icon class="tip-icon"><InfoFilled /></el-icon>
			{{ msg }}
		</div>
		<el-card>
			<el-form
				ref="passwordFormRef"
				:model="passwordForm"
				:rules="formRules"
				label-width="auto"
			>
				<el-row v-if="isError">
					<el-col>
						<el-alert
							center
							:title="policyErrorDesc"
							type="warning"
							:closable="false"
							show-icon
							:close-text="t('重新登录')"
							@close="logout"
						/>
					</el-col>
				</el-row>
				<el-row>
					<el-col>
						<el-form-item :label="t('原密码')" prop="oldPassword">
							<el-input
								v-model="passwordForm.oldPassword"
								:type="flag ? 'text' : 'password'"
								autocomplete="off"
							>
								<template #suffix>
									<el-icon class="iconPos" @click.stop="flag = !flag">
										<View />
									</el-icon>
								</template>
							</el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col>
						<el-form-item :label="t('新密码')" prop="newPasswordOne">
							<el-input
								v-model="passwordForm.newPasswordOne"
								:type="flag1 ? 'text' : 'password'"
								autocomplete="off"
							>
								<template #suffix>
									<el-icon class="iconPos" @click.stop="flag1 = !flag1">
										<View />
									</el-icon>
								</template>
							</el-input>
							<span v-if="showPwdStr" class="lengthStrClass">
								({{ lengthStr }})
							</span>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col>
						<el-form-item :label="t('密码强度')">
							<el-progress
								:percentage="percentage"
								:color="customColorMethod"
								:format="percentageFormat"
								style="line-height: 22px"
							/>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row>
					<el-col>
						<el-form-item :label="t('确认密码')" prop="newPasswordTwo">
							<el-input
								v-model="passwordForm.newPasswordTwo"
								:type="flag2 ? 'text' : 'password'"
								autocomplete="off"
							>
								<template #suffix>
									<el-icon class="iconPos" @click.stop="flag2 = !flag2">
										<View />
									</el-icon>
								</template>
							</el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
		</el-card>
		<div class="dialog-footer">
			<el-button type="primary" @click="cancel">{{ t('取消') }}</el-button>
			<el-button type="success" @click="save">{{ t('保存') }}</el-button>
			<el-button v-if="isPasswordExpires" type="warning" @click="useLastPwd">
				{{ t('延用密码') }}
			</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { InfoFilled, View } from '@element-plus/icons-vue';
import AuthConstant from '@/constant/auth-constant';
import { getLocale } from '@/utils/i18n/i18n-util';
import { getPolicyErrorCode } from '@/utils/base/user-store-util';
import cryptUtil from '@/utils/crypt/index.js';
import { closeHosBizDialog } from '@/composables/useHosBiz';
import { useUserStore } from '@/stores/user';
import {
	changePassword,
	fetchPwdPolicy,
	fetchForcingPwdPolicy,
	useLastPassword,
	validateOldPassword1,
	validateOldPassword2,
} from '@/api/sys-password';

type PwdPolicy = {
	minSize?: number | string;
	complexity?: string;
	keepPas?: string;
};

const props = withDefaults(
	defineProps<{
		personUuid?: string;
		code?: string;
		msg?: string;
		callback?: () => void;
	}>(),
	{
		personUuid: '',
		code: '',
		msg: '',
	},
);

const { t } = useI18n();
const userStore = useUserStore();

const passwordFormRef = ref<FormInstance>();
const isPasswordExpires = ref(false);
const flag = ref(false);
const flag1 = ref(false);
const flag2 = ref(false);
const showLastBtn = ref(false);
const lengthStr = ref('');
const showPwdStr = ref(false);
const pwdPolicy = ref<PwdPolicy>({});
const passwordForm = reactive({
	oldPassword: '',
	newPasswordOne: '',
	newPasswordTwo: '',
});
const percentage = ref(0);
const isError = ref(false);
const policyErrorDesc = ref('');

function minSizeNumber() {
	const n = Number(pwdPolicy.value.minSize);
	return Number.isFinite(n) ? n : 0;
}

function checkComplexity(value: string, token: string) {
	if (!pwdPolicy.value.complexity?.includes(token)) return true;
	const patterns: Record<string, RegExp> = {
		number: /\d+/,
		letter: /[a-zA-Z]+/,
		lowercaseLetter: /[a-z]+/,
		capitalLetter: /[A-Z]+/,
		pecialCharacters: /((?=[\x21-\x7e]+)[^A-Za-z0-9])/,
	};
	const re = patterns[token];
	return re ? re.test(value) : true;
}

const formRules = computed<FormRules>(() => ({
	oldPassword: [
		{
			required: true,
			trigger: 'blur',
			validator: (_rule, value, callback) => {
				if (!value) {
					callback(new Error(t('请输入原密码')));
					return;
				}
				const api = props.personUuid
					? validateOldPassword2
					: validateOldPassword1;
				const payload = {
					oldPassword: cryptUtil.crypt(value),
					personUuid: props.personUuid || null,
				};
				api(payload).then((res) => {
					if (res?.code == 200 && res.data === true) {
						callback();
					} else {
						callback(new Error(String(res?.msg || '')));
					}
				});
			},
		},
	],
	newPasswordOne: [
		{
			required: true,
			trigger: 'blur',
			validator: (_rule, value, callback) => {
				if (!value) {
					callback(new Error(t('请输入新密码')));
					return;
				}
				const min = minSizeNumber();
				if (min > 0 && value.length < min) {
					callback(new Error(t('新密码长度不符合密码策略要求')));
					return;
				}
				const tokens = [
					'number',
					'letter',
					'lowercaseLetter',
					'capitalLetter',
					'pecialCharacters',
				] as const;
				for (const token of tokens) {
					if (!checkComplexity(value, token)) {
						callback(new Error(t('新密码不符合密码复杂度要求')));
						return;
					}
				}
				callback();
			},
		},
	],
	newPasswordTwo: [
		{
			required: true,
			trigger: 'blur',
			validator: (_rule, value, callback) => {
				if (!value) {
					callback(new Error(t('请再次输入新密码')));
					return;
				}
				if (value !== passwordForm.newPasswordOne) {
					callback(new Error(t('两次输入的密码不一致')));
					return;
				}
				callback();
			},
		},
	],
}));

watch(
	() => passwordForm.newPasswordOne,
	(newValue) => {
		let mark = 0;
		if (newValue.length < 5) {
			mark += 5;
		} else if (newValue.length >= 8) {
			mark += 25;
		} else {
			mark += 10;
		}
		if (/[A-Za-z]/.test(newValue)) {
			mark += /[A-Z]/.test(newValue) && /[a-z]/.test(newValue) ? 20 : 10;
		}
		const countNum = newValue.length - newValue.replace(/\d+/g, '').length;
		if (countNum === 1) mark += 10;
		else if (countNum > 1) mark += 20;
		const specialCount =
			newValue.length -
			newValue.replace(
				/[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/g,
				'',
			).length;
		if (specialCount === 1) mark += 10;
		else if (specialCount > 1) mark += 25;
		if (/[A-Za-z]/.test(newValue) && /\d/.test(newValue)) {
			mark += 2;
			if (
				/[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/.test(
					newValue,
				)
			) {
				mark += 1;
				if (/[A-Z]/.test(newValue) && /[a-z]/.test(newValue)) mark += 2;
			}
		}
		percentage.value = mark;
	},
);

function complexityLabel(complexity: string) {
	const map: Record<string, string> = {
		'number,letter': '数字、字母',
		'number,lowercaseLetter,capitalLetter': '数字、小写字母、大写字母',
		'number,letter,pecialCharacters': '数字、字母、特殊字符组合',
		'number,lowercaseLetter,capitalLetter,pecialCharacters':
			'数字、小写字母、大写字母、特殊字符组合',
	};
	return map[complexity] || '';
}

function applyPwdPolicy(data: PwdPolicy, policyErrorCode: string | null) {
	pwdPolicy.value = data;
	const hasMin =
		data.minSize != null && data.minSize !== '' && Number(data.minSize) > 0;
	const hasComplexity = !!data.complexity;
	const forcing = !!props.personUuid;

	if (forcing) {
		showPwdStr.value = hasMin || hasComplexity;
	} else {
		showPwdStr.value = !!(hasMin || hasComplexity);
	}

	let str = '';
	if (hasMin) {
		str += `${t('密码最小长度为')}${data.minSize}，`;
	}
	if (data.complexity) {
		const pass = complexityLabel(data.complexity);
		if (pass) str += `${t('密码中至少包含')}${t(pass)}，`;
	}
	if (data.keepPas === 'true' && policyErrorCode === '003') {
		showLastBtn.value = true;
	}
	if (str.length > 0) {
		lengthStr.value = str.slice(0, -1);
	}
}

async function loadPwdPolicy(policyErrorCode: string | null) {
	const isForcing = !!props.personUuid;
	const fetcher = isForcing ? fetchForcingPwdPolicy : fetchPwdPolicy;
	const { code, data } = await fetcher();
	if (code == 200 && data && typeof data === 'object') {
		applyPwdPolicy(data as PwdPolicy, policyErrorCode);
	}
}

function customColorMethod(p: number) {
	if (p < 30) return '#ff0000';
	if (p < 50) return '#ff5500';
	if (p < 70) return '#ffaa00';
	if (p < 90) return '#ffaa7f';
	return '#67c23a';
}

function flagHide() {
	flag.value = false;
	flag1.value = false;
	flag2.value = false;
}

function percentageFormat(p: number) {
	if (p >= 90) return t('非常安全');
	if (p >= 80) return t('安全');
	if (p >= 70) return t('非常强');
	if (p >= 60) return t('强');
	if (p >= 50) return t('一般');
	if (p >= 25) return t('弱');
	return t('非常弱');
}

async function logout() {
	await userStore.Logout({});
	props.callback?.();
}

function closeDialogs() {
	closeHosBizDialog({ _uid: 'forcedJumpSetPassword' });
	closeHosBizDialog({ _uid: 'setPassword' });
	window.parent.postMessage('cancel', '*');
}

async function cancel() {
	await logout();
	closeDialogs();
}

async function useLastPwd() {
	const { code } = await useLastPassword({ personUuid: props.personUuid });
	if (code == 200) {
		showLastBtn.value = false;
		await cancel();
		ElMessage.success(t('延用上次密码成功'));
	} else {
		showLastBtn.value = true;
		ElMessage.error(t('延用上次密码失败'));
	}
}

async function save() {
	const form = passwordFormRef.value;
	if (!form) return;
	await form.validate(async (valid) => {
		if (!valid) return;
		const pwdForm = {
			oldPassword: cryptUtil.crypt(passwordForm.oldPassword),
			newPassword: cryptUtil.crypt(passwordForm.newPasswordOne),
			rePassword: cryptUtil.crypt(passwordForm.newPasswordTwo),
			personUuid: props.personUuid,
			type: 'form',
		};
		const { code, msg } = await changePassword(pwdForm);
		if (code == 200) {
			ElMessage.success(t(String(msg)));
			await cancel();
			props.callback?.();
			closeHosBizDialog({ _uid: 'setPassword' });
			window.parent.postMessage('cancel', '*');
		} else {
			ElMessage.error(String(msg));
		}
	});
}

onMounted(() => {
	const mask = document.querySelector('.login-loading-mask') as HTMLElement | null;
	if (mask) mask.style.display = 'none';

	getLocale();

	const policyErrorCode = getPolicyErrorCode() as string | null;
	if (
		policyErrorCode &&
		AuthConstant.passwordError[policyErrorCode as keyof typeof AuthConstant.passwordError]
	) {
		isError.value = true;
		policyErrorDesc.value =
			AuthConstant.passwordError[
				policyErrorCode as keyof typeof AuthConstant.passwordError
			];
	}

	if (props.code === '101-002-005-003') {
		isPasswordExpires.value = true;
	}

	loadPwdPolicy(policyErrorCode);
});
</script>

<style scoped lang="scss">
.change-pass :deep(.el-form-item) {
	margin-bottom: 20px;
}
.change-pass .el-form {
	width: 460px;
	padding: 0 15px;
	margin: auto;
}
.change-pass .dialog-footer {
	text-align: center;
	padding-bottom: 15px;
	.el-button + .el-button {
		margin-left: 80px;
	}
}
.change-pass :deep(.el-input__suffix) {
	right: 10px;
}
.setWidth {
	padding: 15px;
	padding-top: 0;
}
.force-setpassword-tip {
	box-sizing: border-box;
	display: flex;
	align-items: center;
	gap: 8px;
	width: 640px;
	min-height: 32px;
	padding: 8px 15px;
	margin-bottom: 15px;
	font-size: 14px;
	line-height: 1;
	color: rgba(71, 129, 243, 1);
	background: #e8effd;
	border: 1px solid #4781f3;
	border-radius: 5px;
	.tip-icon {
		color: #4781f3;
	}
}
.iconPos {
	cursor: pointer;
}
.lengthStrClass {
	margin-left: 4px;
	font-size: 12px;
	color: #909399;
}
</style>
