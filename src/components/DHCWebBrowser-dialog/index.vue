<template>
	<!-- 下载医为客户端 S -->
	<hos-dialog
		:title="$t('安装医为客户端基础环境')"
		:visible.sync="DHCWebBrowser"
		width="45%"
		:append-to-body="true"
		custom-class="DHCWebBrowser-dialog"
		:close-on-click-modal="false"
		:close-on-press-escape="false"
		:show-close="true"
	>
		<hos-row>
			<hos-col :span="16"
				><div class="grid-content bg-purple text">
					<div>
						{{ $t('1. 需要安装医为客户端，请点击按钮下载最新安装包！') }}
						<div class="downBut">
							<hos-button type="primary" @click="download" size="large">
								{{ $t('点击下载安装') }}</hos-button
							>
						</div>
					</div>
					<div>
						{{ $t('2. 安装已下载好的msi安装包，') }}
						{{ $t('或 "我曾经安装过" ,点击按钮运行管理程序。') }}
					</div>
					<div class="downBut">
						<hos-button
							type="success"
							size="large"
							@click="openWebsysServerSetup"
							>{{ $t('运行管理程序') }}</hos-button
						>
					</div>
					<div>{{ $t('成功启动客户端管理程序后,重新进入登录界面即可。') }}</div>
				</div></hos-col
			>
			<hos-col :span="8"
				><div class="grid-content bg-purple-light">
					<img src="@/assets/images/dhcDialog.png" /></div
			></hos-col>
		</hos-row>
	</hos-dialog>
	<!-- 下载医为客户端 S -->
</template>

<script>
import UserConstant from '@/constant/user-constant';
let CmdShell = null;

const initializeCmdShell = async () => {
	let platform = window.navigator.platform;
	let windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];

	if (windowsPlatforms.includes(platform)) {
	} else if (/Linux/.test(platform)) {
		const module = await import('@/utils/websys.addins.linux.js');
		CmdShell = module; // 将模块赋值给 CmdShell
	} else {
		console.error('无法确定当前系统类型');
		throw new Error('未知系统类型');
	}
};

export default {
	name: 'DHCWebBrowser',
	props: ['status'],
	data() {
		return {
			DHCWebBrowser: false,
		};
	},
	created() {
		let platform = window.navigator.platform;
		let windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
		if (windowsPlatforms.includes(platform)) {
			// windows系统
			this.getClientConfig().then((status) => {
				if (status != 200) {
					this.DHCWebBrowser = true;
				}
			});
		} else if (/Linux/.test(platform)) {
			debugger;
			// linux系统
			this.initializeApplication();
		} else {
			console.error('无法确定当前系统类型');
			throw new Error('未知系统类型');
		}
	},
	mounted() {},
	computed: {},
	watch: {},
	methods: {
		async initializeApplication() {
			await initializeCmdShell();
			// 可在此处调用其它方法，例如:
			CmdShell.default.CmdShell.notReturn = 0;
			var ip = '';
			var hostName = '';
			var mac = '';
			var state = 404;

			// 获得 IP,MAC,计算机名
			CmdShell.default.CmdShell.GetConfig(function (data) {
				state = 200;
				if ('string' == typeof data) {
					var json = JSON.parse(data);
					ip = json.IP;
					hostName = json.HostName;
					mac = json.Mac;
				} else {
					ip = data.IP;
					hostName = data.HostName;
					mac = data.Mac;
				}
			});

			setTimeout(() => {
				window.postMessage({ DHCWebBrowserStatus: state }, '*');
				this.$ls.set(UserConstant.IP, ip);
				this.$ls.set(UserConstant.Mac, mac);
				this.$ls.set(UserConstant.HostName, hostName);
			}, 500);
		},
		getClientConfig() {
			return new Promise((resolve, reject) => {
				this.$api('websys.cmd')
					.then((res) => {
						if (res.status == '200') {
							var rtn = res.rtn;
							var config = JSON.parse(rtn);
							if (config) {
								this.$ls.set(UserConstant.IP, config.IP);
								this.$ls.set(UserConstant.HostName, config.HostName);
								this.$ls.set(UserConstant.Mac, config.Mac);
								resolve(res.status);
							}
						}
						resolve(500);
					})
					.catch((error) => {
						resolve(500);
					});
			});
		},
		download() {
			let a = document.createElement('a');
			a.href = '/static/WebsysServerSetup.msi';
			a.download = 'WebsysServerSetup.msi';
			a.click();
			a.remove();
		},
		openWebsysServerSetup() {
			location.href = 'RunWebsysServer://1';
			this.$router.go(0);
			return false;
		},
	},
};
</script>
<style lang="scss">
.DHCWebBrowser-dialog {
	.hos-dialog__body {
		padding: 0 40px 40px 40px !important;
		line-height: 40px;
		.text {
			font-weight: 400;
			color: #000000;
		}
		.downBut {
			margin-left: 100px;
		}
		.hos-button {
			margin: 20px 0;
		}
	}
	.hos-dialog__header {
		text-align: center;
		padding: 40px 15px !important;
		border-bottom: 0px solid #e2e2e2;
	}
	.hos-dialog__title {
		font-size: 24px;
		font-weight: bold;
	}
}
</style>
