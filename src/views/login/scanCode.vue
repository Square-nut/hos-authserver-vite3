<template>
	<div class="scan-code">
		<el-image class="phone-code" :src="QRcodeInfo.scanCode">
			<template #placeholder>
				<div class="image-slot">{{ $t('加载中') }}<span class="dot">...</span></div>
			</template>
			<template #error>
				<div class="image-slot">
					<el-icon class="is-loading"><Loading /></el-icon>
				</div>
			</template>
		</el-image>
		<div class="phone-code-text">
			<span>{{ $t('打开手机') }}</span
			><span style="margin-left: 18px">{{ $t('扫描二维码登录') }}</span>
		</div>
		<!-- <el-button @click="test">测试</el-button> -->
	</div>
</template>
<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import AuthConstant from '@/constant/auth-constant';
import { fetchPhoneScan, fetchPhoneScanStatus } from '@/api/scan-code';
import { useUserStore } from '@/stores/user';
import postDialog from './post-dialog.vue';
import { openHosBizDialog } from '@/composables/useHosBiz';
import { Loading } from '@element-plus/icons-vue';

const { t } = useI18n();

const props = defineProps<{
	activeType?: string;
}>();

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

interface QRcodeInfoType {
	scanCode: string;
	scanCodeKey: string;
}

const QRcodeInfo = ref<QRcodeInfoType>({
	scanCode: '',
	scanCodeKey: '',
});
const timer = ref<ReturnType<typeof setInterval> | ''>('');
const QRcodeTimer = ref<ReturnType<typeof setInterval> | ''>('');
const loading = ref(false);

watch(
	() => props.activeType,
	(newVal) => {
		if (newVal == 'scanCode') {
			getPhoneScan();
		} else {
			stopInterval();
		}
	},
	{ immediate: true }
);

onBeforeUnmount(() => {
	stopInterval();
});

function test() {
	openHosBizDialog({
		component: postDialog,
		_uid: 'postDialog',
		props: {},
	});
}

function start() {
	stopInterval();
	timer.value = setInterval(() => {
		getPhoneScanStatus();
	}, 1000);
	QRcodeTimer.value = setInterval(() => {
		getPhoneScan();
	}, 60000);
}

function stopInterval() {
	if (timer.value) {
		clearInterval(timer.value);
	}
	if (QRcodeTimer.value) {
		clearInterval(QRcodeTimer.value);
	}
}

function getPhoneScan() {
	fetchPhoneScan()
		.then((res) => {
			if (res && res.code == '200') {
				QRcodeInfo.value = res.data as QRcodeInfoType;
				start();
			} else {
				ElMessage.error(res.msg);
				stopInterval();
			}
		})
		.catch((err: { msg?: string }) => {
			ElMessage.error(err.msg);
			stopInterval();
		});
}

function getPhoneScanStatus() {
	const upData = {
		scanCodeKey: QRcodeInfo.value.scanCodeKey,
	};
	fetchPhoneScanStatus(upData)
		.then((res) => {
			if (res.code && res.code == 200) {
				const payload = (res.data ?? {}) as Record<string, unknown>
				if (payload.status === 'invalid') {
					stopInterval()
					start()
				} else if (payload.status === 'confirm') {
					stopInterval()
					const loginData = {
						grantType: 'scanCode',
						phoneAccessToken: payload.accessToken,
					}
					loginFn(loginData)
				} else if (payload.status === 'no-access') {
					ElMessage.error(t('无访问权限'));
					stopInterval();
				}
			} else {
				stopInterval();
			}
		})
		.catch(() => {
			stopInterval();
		});
}

function loginFn(upData: Record<string, unknown>) {
	useUserStore()
		.Login(upData)
		.then((res) => {
			loading.value = false
			stopInterval()
			if (res && res.code == 200) {
				const data = (res.data ?? {}) as Record<string, unknown>
				if (data.personId) {
					openHosBizDialog({
						component: postDialog,
						_uid: 'postDialog',
						props: {
							personId: data.personId,
							postChainId: data.postChainId,
							postData: upData,
							name: data.name,
							openTwoAuthDialog,
							loginSucessHandler,
						},
					});
				} else if (data.againAuthType) {
					emit(
						'openTwoAuthDialog',
						String(data.grantChainId ?? ''),
						String(data.authType ?? data.againAuthType ?? ''),
						String(data.accountCode ?? ''),
						data.caData,
						String(data.phone ?? '')
					)
				} else {
					emit('loginSucessHandler');
				}
			}
		})
		.catch((err: { code?: string; msg?: string }) => {
			loading.value = false;
			stopInterval();
			if (!err.code?.includes('101-002-005-')) {
				ElMessage.error(err.msg);
			}
			if (err.code?.includes(AuthConstant.forcedJumpSetPassword)) {
				emit('forcedJumpSetPassword', err);
			}
		});
}

function openTwoAuthDialog(
	grantChainId: string,
	authType: string,
	account: string,
	caData: unknown,
	phone: string
) {
	emit('openTwoAuthDialog', grantChainId, authType, account, caData, phone);
}

function loginSucessHandler() {
	emit('loginSucessHandler');
}
</script>
<style lang="scss" scoped>
.scan-code {
	// 手机扫码
	text-align: center;
	height: 270px;
	padding-top: 25px;

	.phone-code-text {
		color: #ffffff;
		font-size: 16px;
		margin-bottom: 35px;
	}
	.phone-code {
		position: relative;
		width: 210px;
		height: 210px;
		margin-bottom: 14px;
		position: relative;
		background-color: #eee;
		.image-slot {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			font-size: 28px;
		}
		:deep(.el-image__inner) {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			width: 240px;
			height: 240px;
		}
	}
}
</style>
