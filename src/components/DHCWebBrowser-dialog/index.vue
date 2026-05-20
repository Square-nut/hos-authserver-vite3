<template>
	<!-- 下载医为客户端 S -->
	<el-dialog
		v-model="dbdialogStatus"
		:title="title1"
		width="45%"
		append-to-body
		class="DHCWebBrowser-dialog"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
		:show-close="true"
	>
		<el-row :gutter="20">
			<el-col :span="16">
				<div class="grid-content bg-purple text">
					<div>
						{{ title2 }}
						<div class="downBut">
							<el-button type="primary" size="large" @click="download">
								{{ t('点击下载安装') }}
							</el-button>
						</div>
					</div>
					<div>
						{{ t('2. 安装已下载好的医为客户端，') }}
						{{ t('或 "我曾经安装过" ,点击按钮运行管理程序。') }}
					</div>
					<div class="downBut">
						<el-button type="success" size="large" @click="openWebsysServerSetup">
							{{ t('运行管理程序') }}
						</el-button>
					</div>
					<div>{{ t('成功启动客户端管理程序后,重新进入登录界面即可。') }}</div>
				</div>
			</el-col>
			<el-col :span="8">
				<div class="grid-content bg-purple-light">
					<img src="@/assets/images/dhcDialog.png" alt="" />
				</div>
			</el-col>
		</el-row>
	</el-dialog>
	<!-- 下载医为客户端 E -->
</template>

<script setup lang="ts">
import UserConstant from '@/constant/user-constant';
import { returnGlobalValue } from '@/utils';
import { ls } from '@/utils/ls';
import { useSysStore } from '@/stores/sys';
import { storeToRefs } from 'pinia';
import { watch, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { fetchWebsysCmd } from '@/api/websys';

const { t } = useI18n();
const router = useRouter();

defineProps({
	status: {
		type: Number,
		default: 0,
	},
});

const sysStore = useSysStore();
const { showDbdialog } = storeToRefs(sysStore);
const dbdialogStatus = ref(false);
const hideMedical = ref(returnGlobalValue('VUE_APP_HIDE_MEDICAL'));
const title1 = ref('');
const title2 = ref('');

watch(showDbdialog, (newVal) => {
	dbdialogStatus.value = newVal;
});

onMounted(() => {
	if (hideMedical.value) {
		title1.value = t('安装客户端基础环境');
		title2.value = t('1. 需要安装客户端，请点击按钮下载最新安装包！');
	} else {
		title1.value = t('安装医为客户端基础环境');
		title2.value = t('1. 需要安装医为客户端，请点击按钮下载最新安装包！');
	}
});

type WebsysCmdResponse = {
	status?: string | number;
	rtn?: string;
};

function getClientConfig() {
	return new Promise<string | number>((resolve) => {
		fetchWebsysCmd()
			.then((res) => {
				const { status, rtn } = res as WebsysCmdResponse;
				if (String(status) !== '200' || !rtn) return resolve(500);
				const config = JSON.parse(rtn) as {
					IP?: string;
					HostName?: string;
					Mac?: string;
				};
				if (!config) return resolve(500);
				ls.set(UserConstant.IP, config.IP);
				ls.set(UserConstant.HostName, config.HostName);
				ls.set(UserConstant.Mac, config.Mac);
				resolve(status ?? 200);
			})
			.catch(() => resolve(500));
	});
}

function download() {
	const a = document.createElement('a');
	a.href = '/static/WebsysServerSetup.msi';
	a.download = 'WebsysServerSetup.msi';
	a.click();
	a.remove();
}

function openWebsysServerSetup() {
	location.href = 'RunWebsysServer://1';
	router.go(0);
}

defineExpose({
	getClientConfig,
});
</script>
<style lang="scss">
.DHCWebBrowser-dialog.el-dialog {
	.el-dialog__body {
		overflow: hidden !important;
	}
}
</style>
