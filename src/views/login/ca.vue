<!-- CA 弹框 -->
<template>
	<div>
		<!-- <h1 class="dialog-title">{{ caDialog }}</h1> -->
		<div class="ca-dialog" :class="{ 'phone-in-frame': phoneInframe }">
			<!-- UKey 登录 -->
			<div
				v-if="info.loginType === 'UKEY'"
				style="width: 100%; text-align: center"
			>
				<div class="dialog-box">
					<div class="flex-box">
						<img
							class="ca-login-img"
							src="../../assets/images/ca/ukey.png"
							alt=""
						/>
					</div>
					<div class="flex-box">
						<div class="login-type-title">{{ $t('UKey登录') }}</div>
						<el-form
							ref="ukLoginRef"
							label-width=""
							hide-required-asterisk
							class="uk-dynamic"
							:model="ukForm"
							:rules="ukRules"
						>
							<!-- UKEY 下拉框 -->
							<el-form-item label="" prop="strContainerName">
								<el-select
									v-model="ukForm.strContainerName"
									:placeholder="$t('请选择UKEY')"
									class="input-width"
								>
									<el-option
										v-for="(item, index) in ukSelectArray"
										:key="item.value + index"
										:label="item.label"
										:value="item.value"
									>
									</el-option>
								</el-select>
							</el-form-item>
							<!-- 密码 -->
							<el-form-item label="" prop="ukeyPassword">
								<el-input
									v-model="ukForm.ukeyPassword"
									type="password"
									class="input-width"
									:placeholder="$t('请输入密码')"
								></el-input>
							</el-form-item>
							<!-- 岗位 -->
							<!-- <el-form-item prop="post" v-if="!Simple">
								
								<postSelect
									v-if="showPostType"
									ref="caLoginSelect_post"
									:data="postList"
									type="id"
									:personId="personId"
									:disabled="!personId"
									:placeholder="postPlaceholder"
									@change="changePost"
									:show-prefix="false"
								></postSelect>
								<post-select-table
									v-else
									type="id"
									ref="caLoginSelectTable_post"
									uid="caLoginSelectTable_post"
									v-model="ukForm.post"
									:disabled="!personId"
									:placeholder="postPlaceholder"
									@change="changePost"
								></post-select-table>
							</el-form-item> -->
							<!-- 操作按钮 -->
							<!-- <el-form-item label=""> -->
							<el-button
								type="primary"
								@click="handleUkLogin"
								class="input-width ca-login-button"
								>{{ $t('登录') }}</el-button
							>
							<!-- <el-button class="button-width " @click="close">{{$t('取消')}}</el-button> -->
							<!-- </el-form-item> -->
						</el-form>
					</div>
				</div>
			</div>
			<!-- 扫码 登录 iframe -->
			<div
				v-if="phoneInframe"
				style="width: 100%; text-align: center; height: calc(100% - 20px)"
			>
				<iframe
					:src="QRcodeInfo.qrCode"
					style="width: 100%; height: 100%"
				></iframe>
			</div>
			<!-- 扫码 登录 非iframe -->
			<div
				v-if="
					info.loginType === 'PHONE' &&
					QRcodeInfo.qrType != 3 &&
					QRcodeInfo.qrType != 4
				"
			>
				<div class="dialog-box">
					<div class="flex-box">
						<img
							class="ca-login-img"
							src="../../assets/images/ca/pone.png"
							alt=""
						/>
					</div>
					<div class="flex-box phone">
						<div class="login-type-title">{{ $t('扫码登录') }}</div>
						<img
							:src="QRcodeInfo.qrCode"
							class="qrcode"
							:alt="$t('二维码')"
							v-if="QRcodeInfo.qrType == 1"
						/>
						<div
							id="qrcode"
							ref="qrcodeRef"
							class="qrcode"
							v-else-if="QRcodeInfo.qrType == 2"
						></div>
						<div v-else id="qrcode" ref="qrcodeRef" class="qrcode fake-qrcode">
							<img src="@/assets/images/ca/fake.png" />
							<div class="mask">
								<span>{{ $t('二维码生成错误') }}</span>
								<el-icon class="refresh-qr" @click="refreshQR"><Refresh /></el-icon>
							</div>
						</div>
						<!-- <span>请使用<span class="colorF59">北京CA的APP</span>扫码登录</span> -->
						<!-- 二维码过期遮罩 -->
						<div class="mask" v-if="showMask">
							<span>{{ $t('当前二维码已过期') }}</span>
							<el-button class="mar-t-10" @click="refreshQR">{{
								$t('刷新')
							}}</el-button>
						</div>
					</div>
				</div>
			</div>
			<!-- PIN码 登录 -->
			<div
				v-if="info.loginType === 'PINPHONE'"
				style="width: 100%; text-align: center"
			>
				<div class="dialog-box">
					<div class="flex-box">
						<img
							class="ca-login-img"
							src="../../assets/images/ca/pin.png"
							alt=""
						/>
					</div>
					<div class="flex-box">
						<div class="login-type-title">{{ $t('PIN码登录') }}</div>
						<el-form
							ref="pinLoginRef"
							label-width=""
							hide-required-asterisk
							class="pin-dynamic"
							:model="pinForm"
							:rules="pinRules"
						>
							<!-- 用户名 -->
							<el-form-item label="" prop="accountCode">
								<el-input
									v-model="pinForm.accountCode"
									:placeholder="$t('请输入用户名')"
									class="input-width"
								></el-input>
							</el-form-item>
							<!-- PIN码 -->
							<el-form-item label="" prop="passwordPin">
								<el-input
									class="input-width"
									v-model="pinForm.passwordPin"
									type="password"
									:placeholder="$t('请输入PIN码')"
								></el-input>
							</el-form-item>
							<!-- <el-form-item> -->
							<!-- 操作按钮 -->

							<el-button
								type="primary"
								class="input-width ca-login-button"
								@click="handlePinLogin"
								>{{ $t('登录') }}</el-button
							>
							<!-- <el-button class="button-width " @click="close()">{{$t('取消')}}</el-button> -->
							<!-- </el-form-item> -->
						</el-form>
					</div>
				</div>
			</div>
			<!-- 人脸 登录 -->
			<div v-if="info.loginType === 'FACE'">
				{{ $t('人脸') }}
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	ref,
	toRef,
	watch,
} from 'vue';
import type { FormInstance } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import QRCode from 'qrcode';
import { useI18n } from 'vue-i18n';
import { fetchQRData, fetchQRResultData } from '@/api/ca';
import AuthConstant from '@/constant/auth-constant';
import { getLoginErrorDesc } from './js/login';
import postDialog from './post-dialog.vue';
import { useUserStore } from '@/stores/user';
import { closeHosBizDialog, openHosBizDialog } from '@/composables/useHosBiz';
import { useCaUk, type CaLoginInfo } from '@/composables/useCaUk';
import { useCaPin } from '@/composables/useCaPin';
import { ls } from '@/utils/ls';

const props = withDefaults(
	defineProps<{
		info?: CaLoginInfo;
		loginSucessHandler?: () => void;
		openTwoAuthDialog?: (
			grantChainId: string,
			authType: string,
			account: string,
			phoneDisplay: string,
			chainId: string,
		) => void;
		againLogin?: boolean;
		grantChainId?: string;
		activeType?: string;
		clientId?: string;
		showPostType?: string;
	}>(),
	{
		info: () => ({}),
		loginSucessHandler: () => {},
		openTwoAuthDialog: () => {},
		againLogin: false,
		grantChainId: '',
		activeType: '',
		clientId: '',
	},
);

const { t } = useI18n();

const infoRef = toRef(props, 'info');
const againLoginRef = toRef(props, 'againLogin');

interface QrCodeInfo {
	qrType?: number
	qrCode?: string
	signGUID?: string
	[key: string]: unknown
}

const QRcodeInfo = ref<QrCodeInfo>({});
const timer = ref<ReturnType<typeof setInterval> | null>(null);
const showMask = ref(false);
const delay = ref<ReturnType<typeof setTimeout> | null>(null);
const phoneToken = ref('');
const postChainId = ref('');
const postPlaceholder = ref(t('点击登录按钮后获取岗位单元'));

const ukLoginRef = ref<FormInstance>();
const pinLoginRef = ref<FormInstance>();
const qrcodeRef = ref<HTMLElement>();

const Simple = computed(() => ls.get('hos_login_post_type') == 'simple');

const phoneInframe = computed(
	() =>
		props.info.loginType === 'PHONE' &&
		(QRcodeInfo.value.qrType == 3 || QRcodeInfo.value.qrType == 4),
);

function doLogin(upData: Record<string, unknown>) {
	if (props.againLogin === true) {
		upData.againLogin = true;
	}
	if (props.grantChainId) upData.grantChainId = props.grantChainId;
	upData.clientId = props.clientId;
	if (postChainId.value) {
		upData.postChainId = postChainId.value;
		upData.post = ukForm.post;
	}
	useUserStore()
		.Login(upData)
		.then((res) => {
			if (res && res.code == 200) {
				if (res.data?.personId && !Simple.value) {
					postPlaceholder.value = t('请选择岗位单元');
					if (
						props.info.loginType === 'PHONE' ||
						props.info.loginType === 'UKEY'
					) {
						openHosBizDialog({
							component: postDialog,
							_uid: 'postDialog',
							props: {
								personId: res.data.personId,
								postChainId: res.data.postChainId,
								postData: upData,
								name: res.data.name,
								loginSucessHandler: props.loginSucessHandler,
							},
						});
						closeHosBizDialog({ _uid: 'CADialog' });
					}
				} else {
					props.loginSucessHandler();
				}
				closeHosBizDialog({ _uid: 'CADialog' });
			} else {
				ElMessage.error(res.msg);
				closeHosBizDialog({ _uid: 'CADialog' });
			}
		})
		.catch((err: { code?: string; data?: Record<string, unknown>; msg?: string }) => {
			const code = err.code;
			if (code === AuthConstant.twoAuthErrorCode) {
				const grantChainId = err.data?.grantChainId as string;
				const authType = err.data?.againAuthType as string;
				const account = err.data?.accountCode as string;
				const phoneDisplay = err.data?.phoneDisplay as string;
				props.openTwoAuthDialog(
					grantChainId,
					authType,
					account,
					phoneDisplay,
					grantChainId,
				);
			} else {
				const errorDesc = getLoginErrorDesc(String(code ?? ''), err.msg);
				if (!errorDesc || errorDesc == '') {
					t('短信登录失败，请重新再试！');
				}
				ElMessage.error(err.msg);
				closeHosBizDialog({ _uid: 'CADialog' });
			}
		});
}

const {
	ukSelectArray,
	ukForm,
	ukRules,
	initUkLogin,
	reloadUkOnActiveTypeChange,
	ukLogin,
	changePost,
} = useCaUk({
	info: infoRef,
	againLogin: againLoginRef,
	postChainId,
	login: doLogin,
});

const { pinForm, pinRules, pinLogin } = useCaPin({
	info: infoRef,
	login: doLogin,
});

function handleUkLogin() {
	ukLogin(ukLoginRef.value);
}

function handlePinLogin() {
	pinLogin(pinLoginRef.value);
}

function start() {
	if (timer.value) clearInterval(timer.value);
	const scanFrequency = Number(props.info.scanFrequency) * 1000;
	timer.value = setInterval(() => {
		getQRResultData();
	}, scanFrequency);
}

function isShowMask() {
	showMask.value = false;
	if (delay.value) clearTimeout(delay.value);
	const qrValidity = Number(props.info.qrValidity) * 1000;
	delay.value = setTimeout(() => {
		if (timer.value) clearInterval(timer.value);
		showMask.value = true;
	}, qrValidity);
}

function refreshQR() {
	getQrCode();
}

function getQrCode() {
	const upData = {
		venderCode: props.info.venderCode,
		loginType: props.info.loginType,
	};
	fetchQRData(upData)
		.then((res) => {
			if (res && res.code == '200') {
				const payload = { ...(res.data as Record<string, unknown>) }
				if (payload.qrType == 4) {
					const tmpUlr = new URL(String(payload.qrCode))
					tmpUlr.protocol = 'https:'
					tmpUlr.hostname = String(__hos.QRCODE_DOMAIN ?? '')
					payload.qrCode = tmpUlr.toString()
				}
				QRcodeInfo.value = payload
				if (payload.qrType == 2) {
					let str = ''
					if (typeof payload.qrCode === 'string') {
						str = payload.qrCode
					} else {
						str = JSON.stringify(payload.qrCode)
					}
					renderQrcode(str, 198, 198)
				}
				start()
				isShowMask();
			} else {
				ElMessage.error(res.msg);
				if (timer.value) clearInterval(timer.value);
				if (delay.value) clearTimeout(delay.value);
			}
		})
		.catch((err: { msg?: string }) => {
			ElMessage.error(err.msg);
			if (timer.value) clearInterval(timer.value);
			if (delay.value) clearTimeout(delay.value);
		});
}

function getQRResultData() {
	const upData = {
		venderCode: props.info.venderCode,
		loginType: props.info.loginType,
		signGUID: QRcodeInfo.value.signGUID,
	};
	fetchQRResultData(upData).then((res) => {
		if (res && res.code == '200') {
			const payload = (res.data ?? {}) as Record<string, unknown>
			if (
				payload.signStatus != 'TOSIGN' &&
				payload.signStatus != 'FINISH'
			) {
				if (timer.value) clearInterval(timer.value)
				if (delay.value) clearTimeout(delay.value)
				showMask.value = true
			} else if (payload.signStatus === 'FINISH') {
				phoneToken.value = String(payload.phoneToken ?? '')
				if (timer.value) clearInterval(timer.value);
				if (delay.value) clearTimeout(delay.value);
				doLogin({
					grantType: 'ca',
					caPhoneToken: phoneToken.value,
					venderCode: props.info.venderCode,
					loginType: props.info.loginType,
				});
			}
		} else {
			if (timer.value) clearInterval(timer.value);
			if (delay.value) clearTimeout(delay.value);
		}
	});
}

function renderQrcode(content: string, w: number, h: number) {
	nextTick(() => {
		const el = qrcodeRef.value;
		if (!el) return;
		el.innerHTML = '';
		const canvas = document.createElement('canvas');
		QRCode.toCanvas(canvas, content, {
			width: w,
			margin: 0,
			color: {
				dark: '#f7382b',
				light: '#ffffff',
			},
		});
		el.appendChild(canvas);
	});
}

watch(
	() => props.activeType,
	(newVal, oldVal) => {
		if (
			newVal != oldVal &&
			newVal === props.info.type &&
			props.info.loginType === 'PHONE'
		) {
			if (oldVal === undefined) return;
			getQrCode();
		} else {
			if (timer.value) clearInterval(timer.value);
			if (delay.value) clearTimeout(delay.value);
		}
		reloadUkOnActiveTypeChange(newVal, oldVal);
	},
	{ immediate: true },
);

onMounted(() => {
	if (props.info.loginType === 'PHONE') {
		getQrCode();
	}
	initUkLogin();
});

onBeforeUnmount(() => {
	if (timer.value) clearInterval(timer.value);
	if (delay.value) clearTimeout(delay.value);
});

defineExpose({
	reset() {
		postPlaceholder.value = t('点击登录按钮后获取岗位单元');
		postChainId.value = '';
		ukForm.post = '';
	},
	changePost,
});
</script>
<style lang="scss" scoped>
.mar-t-10 {
	margin-top: 10px;
}
.input-width {
	width: 260px;
	height: 36px;
	:deep(.el-input__inner) {
		height: 36px;
		line-height: 36px;
	}
}
.button-width {
	width: 86px;
}
.mar-r-28 {
	margin-right: 28px;
}
.ca-login-button {
	margin-top: 10px;
}
.ca-error-msg {
	color: #fa3939;
	font-size: 14px;
}
.dialog-title {
	text-align: center;
	color: #000;
}
.ca-dialog {
	padding: 0 14px;
	height: 429px;
	display: flex;
	justify-content: center;
	align-items: center;
	:deep(.el-form-item) {
		margin-bottom: 24px;
	}
	&.phone-in-frame {
		height: 560px;
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
		width: 260px;
		height: 260px;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		// 二维码图片
		.qrcode {
			height: 198px;
			width: 198px;
			img {
				width: 100%;
			}
			&.fake-qrcode {
				position: relative;
				.mask {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					opacity: 0.9;
					background: #fff;
					font-size: 16px;
					color: #000;
					span {
						display: inline-block;
					}
					i {
						display: inline-block;
						cursor: pointer;
						font-size: 14px;
					}
				}
			}
		}
		// 二维码过期遮罩
		.mask {
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			width: 210px;
			height: 210px;
			background-color: #fff;
			opacity: 0.9;
			position: absolute;
			bottom: 0;
			// top: 0;
			// left:0;
		}
		.colorF59 {
			color: #f59a23;
		}
	}
}
</style>
<style lang="scss"></style>
