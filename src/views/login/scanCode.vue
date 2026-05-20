<template>
	<div class="scan-code">
		<el-image class="phone-code" :src="QRcodeInfo.scanCode">
			<template #placeholder>
				<div class="image-slot">{{ $t('加载中') }}<span class="dot">...</span></div>
			</template>
			<template #error>
				<div class="image-slot">
					<i class="el-icon-loading"></i>
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
<script>
import AuthConstant from '@/constant/auth-constant';
import { fetchPhoneScan, fetchPhoneScanStatus } from '@/api/scan-code';
import { useUserStore } from '@/stores/user';
import postDialog from './post-dialog.vue';
import { openHosBizDialog } from '@/composables/useHosBiz';
export default {
	props: ['activeType'],
	data() {
		return {
			QRcodeInfo: {
				scanCode: '',
				scanCodeKey: '',
			}, // 获取二维码
			timer: '', // 扫码结果轮询
			QRcodeTimer: '', // 每60秒刷新一下二维码
		};
	},
	watch: {
		activeType: {
			immediate: true, //首次加载的时候执行函数
			handler: function (newVal) {
				if (newVal == 'scanCode') {
					this.getPhoneScan();
				} else {
					this.stopInterval();
				}
			},
		},
	},
	beforeUnmount() {
		this.stopInterval();
	},
	methods: {
		test() {
			openHosBizDialog({
				component: postDialog,
				_uid: 'postDialog',
				props: {},
			});
		},
		// 循环请求二维码扫描结果
		start() {
			this.stopInterval();
			this.timer = setInterval(() => {
				// 获取扫描结果
				this.getPhoneScanStatus();
			}, 1000);
			// 每60秒刷新一下二维码
			this.QRcodeTimer = setInterval(() => {
				// 获取扫描结果
				this.getPhoneScan();
			}, 60000);
		},
		// 清楚轮询
		stopInterval() {
			clearInterval(this.timer);
			clearTimeout(this.QRcodeTimer);
		},
		// 获取扫码登录二维码
		getPhoneScan() {
			fetchPhoneScan()
				.then((res) => {
					if (res && res.code == '200') {
						this.QRcodeInfo = res.data;
						this.start();
					} else {
						// 二维码接口错误不轮询
						this.$message.error(res.msg);
						this.stopInterval();
					}
				})
				.catch((err) => {
					// 二维码接口错误不轮询
					this.$message.error(err.msg);
					this.stopInterval();
				});
		},
		// 获取扫码结果
		getPhoneScanStatus() {
			let upData = {
				scanCodeKey: this.QRcodeInfo.scanCodeKey,
			};
			fetchPhoneScanStatus(upData)
				.then((res) => {
					if (res.code && res.code == 200) {
						// 二维码过期，重新请求二维码
						if (res.data.status === 'invalid') {
							this.stopInterval();
							this.start();
						} else if (res.data.status === 'confirm') {
							this.stopInterval();
							// this.$t(登录)
							let upData = {
								grantType: 'scanCode',
								phoneAccessToken: res.data.accessToken,
							};
							this.loginFn(upData);
						} else if (res.data.status === 'no-access') {
							// this.$t(无权限访问)
							this.$message.error(this.$t('无访问权限'));
							this.stopInterval();
						}
					} else {
						this.stopInterval();
					}
				})
				.catch((err) => {
					this.stopInterval();
				});
		},
		// 登录
		loginFn(upData) {
			useUserStore().Login(upData)
				.then((res) => {
					this.loading = false;
					this.stopInterval();
					// 登录成功跳转
					if (res && res.code == 200) {
						// postDialog
						// 获取岗位信息并展示下拉列表
						if (res.data.personId) {
							openHosBizDialog({
								component: postDialog,
								_uid: 'postDialog',
								props: {
									personId: res.data.personId,
									postChainId: res.data.postChainId,
									postData: upData,
									name: res.data.name,
									openTwoAuthDialog: this.openTwoAuthDialog,
									loginSucessHandler: this.loginSucessHandler,
								},
							});
						} else if (res.data.againAuthType) {
							// 需要二次认证
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
					this.stopInterval();
					if (!err.code.includes('101-002-005-')) {
						this.$message.error(err.msg);
					}
					// 强制修改密码弹窗
					if (err.code.includes(AuthConstant.forcedJumpSetPassword)) {
						this.$emit('forcedJumpSetPassword', err);
					}
				});
		},
		openTwoAuthDialog(grantChainId, authType, account, caData, phone) {
			this.$emit(
				'openTwoAuthDialog',
				grantChainId,
				authType,
				account,
				caData,
				phone
			);
		},
		loginSucessHandler() {
			// 不需要二次认证
			this.$emit('loginSucessHandler');
		},
	},
};
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
		::v-deep .el-image__inner {
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
