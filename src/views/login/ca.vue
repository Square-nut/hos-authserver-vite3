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
							ref="ukLogin"
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
								@click="ukLogin('ukLogin')"
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
							ref="qrcode"
							class="qrcode"
							v-else-if="QRcodeInfo.qrType == 2"
						></div>
						<div v-else id="qrcode" ref="qrcode" class="qrcode fake-qrcode">
							<img src="@/assets/images/ca/fake.png" />
							<div class="mask">
								<span>{{ $t('二维码生成错误') }}</span>
								<i @click="refreshQR" class="el-icom-big-refresh"></i>
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
							ref="pinLogin"
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
								@click="pinLogin('pinLogin')"
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
<script>
import QRCode from 'qrcode';
import { ukMixinData } from './js/uk';
import { pinMixinData } from './js/pin';
import AuthConstant from '@/constant/auth-constant';
import { getLoginErrorDesc } from './js/login';
import postSelect from './components/post-select.vue';
import postSelectTable from './components/post-select-table.vue';
import postDialog from './post-dialog.vue';
import { useUserStore } from '@/stores/user';
import { closeHosBizDialog, openHosBizDialog } from '@/composables/useHosBiz';
export default {
	name: 'CA',
	components: { postSelect, postSelectTable },
	props: {
		// 获取登录类型和方式
		info: {
			type: Object,
			default: {},
		},
		// 登录成功的回调
		loginSucessHandler: {
			type: Function,
			default: () => {},
		},
		// 二次登录的回调
		openTwoAuthDialog: {
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
		// 当前选中的登录方式  解决扫码和多个UK的问题
		activeType: {
			type: String,
			default: '',
		},
		clientId: {
			type: String,
			default: '',
		},
		showPostType: String,
	},
	// 混入uk登录方法 为了区分其他登录逻辑，定义参数不能重复
	mixins: [ukMixinData, pinMixinData],
	data() {
		return {
			QRcodeInfo: {}, // 获取二维码数据
			timer: null, // 定时器请求二维码扫描结果
			showMask: false, // 是否显示二维码过期遮罩
			delay: null, // 延迟器 二维码过期遮罩
			phoneToken: '', // 扫码成功的返回值，用于登录
			caDialog: this.$t('胜利油田中心医院'),

			post: '',
			postList: [],
			personId: '',
			postChainId: '',
			form: {
				model: {
					query: '',
					dataType: '',
				},
			},
			cols: [
				{
					prop: 'name',
					label: this.$t('名称'),
					width: '150px',
				},
				// {
				// 	prop: 'type',
				// 	width: '80px',
				// 	label: this.$t('类型'),
				// 	formatter: (row, column, value) => {
				// 		return row.type == 'unit'
				// 			? this.$t('岗位单元')
				// 			: row.type == 'group'
				// 			? this.$t('岗位组')
				// 			: this.$t('岗位');
				// 	},
				// },
				// {
				// 	label: this.$t('业务单元'),
				// 	prop: 'buNames',
				// },
				{
					label: this.$t('岗位'),
					prop: 'postNames',
				},
			],
			valueConfig: {
				label: 'name',
				value: 'id',
			},
			options: [
				{
					label: this.$t('岗位单元'),
					value: 'unit',
				},
				{
					label: this.$t('岗位组'),
					value: 'group',
				},
				{
					label: this.$t('岗位'),
					value: 'post',
				},
			],
			postPlaceholder: this.$t('点击登录按钮后获取岗位单元'),
			// Btab: null
		};
	},
	created() {
		// 非二次登录
		if (this.info.loginType === 'PHONE') {
			this.getQrCode(); // 请求二维码
			// this.start() // 轮询请求扫描结果
		}
	},
	// 二次认证的时候不选择对应的tab 不执行对应的方法
	watch: {
		activeType: {
			immediate: true, //首次加载的时候执行函数
			handler: function (newVal, oldVal) {
				// 选择的是扫码登录 请求二维码 轮询请求结果
				console.log('ac in watch:activeType:', newVal, oldVal);
				if (
					newVal != oldVal &&
					newVal === this.info.type &&
					this.info.loginType === 'PHONE'
				) {
					// 避免初始化时重复加载
					if (oldVal === undefined) return;
					this.getQrCode(); // 请求二维码
					// this.start() // 轮询请求扫描结果
				} else {
					// 选择不是二维码登录 清除轮询和延迟器 避免在别的tab页面切换到扫码页面 过期
					clearInterval(this.timer);
					clearTimeout(this.delay);
				}
				// 二次认证 UKEY登录，请求当前的js文件，避免两个UKEY登录时永远请求最后一个UKEY js文件
				if (
					newVal != oldVal &&
					newVal === this.info.type &&
					this.info.loginType === 'UKEY'
				) {
					this.requireUKJS()
						.then(() => {
							this.analysis();
							this.getCAInitParams();
						})
						.catch((err) => {
							console.error('[CA UKEY] vendor script load failed:', err);
						});
				}
			},
		},
	},
	computed: {
		Simple() {
			return this.$ls.get('hos_login_post_type') == 'simple' ? true : false;
		},
		phoneInframe() {
			return (
				this.info.loginType === 'PHONE' &&
				(this.QRcodeInfo.qrType == 3 || this.QRcodeInfo.qrType == 4)
			);
		},
	},
	beforeUnmount() {
		clearInterval(this.timer);
		clearTimeout(this.delay);
	},
	methods: {
		// 关闭弹框
		close() {
			// this.$store.commit('CLOSE_DIALOG',{_uid:'SCDialog'});
			closeHosBizDialog({ _uid: 'CADialog' });
		},
		// 循环请求二维码扫描结果
		start() {
			clearInterval(this.timer);
			let scanFrequency = this.info.scanFrequency * 1000; // 调用频次  秒 => 毫秒
			this.timer = setInterval(() => {
				// 获取扫描结果
				this.getQRResultData();
			}, scanFrequency);
		},
		// 二维码是否过期
		isShowMask() {
			this.showMask = false; // 不显示遮罩
			clearTimeout(this.delay);
			let qrValidity = this.info.qrValidity * 1000; // 二维码过期时间 秒 => 毫秒
			this.delay = setTimeout(() => {
				// 停止轮询
				clearInterval(this.timer);
				// 显示遮罩
				this.showMask = true;
			}, qrValidity);
		},
		// 刷新二维码
		refreshQR() {
			// 请求二维码接口  打开轮询方法
			this.getQrCode();
			// this.start()
		},
		// 获取 二维码
		getQrCode() {
			let upData = {
				venderCode: this.info.venderCode, // 厂商代码
				loginType: this.info.loginType, // 签名方式代码
			};
			this.$api('ca.getQRData', upData)
				.then((res) => {
					if (res && res.code == '200') {
						if (res.data.qrType == 4) {
							// 江西眼科暂用
							let tmpUlr = new URL(res.data.qrCode);
							tmpUlr.protocol = 'https:';
							tmpUlr.hostname = __hos.QRCODE_DOMAIN;
							res.data.qrCode = tmpUlr.toString();
						}
						this.QRcodeInfo = res.data;
						// qrType 1 显示图片   2 字符串转图片   3 iframe地址.   4 外部打开
						if (res.data.qrType == 2) {
							let str = '';
							if (typeof res.data.qrCode === 'string') {
								str = res.data.qrCode;
							} else {
								str = JSON.stringify(res.data.qrCode);
							}
							// 字符串转二维码
							this.qrcode(str, 198, 198);
						}

						// 轮询请求扫描结果
						this.start();
						// 二维码过期遮罩
						this.isShowMask();
					} else {
						// 二维码接口错误不轮询
						this.$message.error(res.msg);
						clearInterval(this.timer);
						clearTimeout(this.delay);
					}
				})
				.catch((err) => {
					// 二维码接口错误不轮询
					this.$message.error(err.msg);
					clearInterval(this.timer);
					clearTimeout(this.delay);
				});
		},
		// 获取扫描二维码结果
		getQRResultData() {
			let upData = {
				venderCode: this.info.venderCode, // 厂商代码
				loginType: this.info.loginType, // 签名方式代码
				signGUID: this.QRcodeInfo.signGUID, // 二维码唯一标识
			};
			this.$api('ca.getQRResultData', upData).then((res) => {
				if (res && res.code == '200') {
					// signStatus = 'TOSIGN' 继续轮询结果，否则停止并显示遮罩
					if (
						res.data.signStatus != 'TOSIGN' &&
						res.data.signStatus != 'FINISH'
					) {
						clearInterval(this.timer);
						clearTimeout(this.delay);
						// 显示遮罩
						this.showMask = true;
					}
					// 监听到扫描成功 清楚定时器 清楚延迟器
					else if (res.data.signStatus === 'FINISH') {
						// if(this.QRcodeInfo.qrType == 4 && this.Btab != null) this.Btab.close()
						this.phoneToken = res.data.phoneToken;
						clearInterval(this.timer);
						clearTimeout(this.delay);
						// 登录
						let upData = {
							grantType: 'ca',
							caPhoneToken: this.phoneToken,
							venderCode: this.info.venderCode, // 厂商代码
							loginType: this.info.loginType, // 签名方式代码
						};
						this.login(upData);
					}
				} else {
					clearInterval(this.timer);
					clearTimeout(this.delay);
				}
			});
		},
		// 登录流程  所有登录形式最后都走到登录流程来
		login(upData) {
			// 如果是二次登录 添加两个参数
			if (this.againLogin === true) {
				upData.againLogin = true;
			}
			if (this.grantChainId) upData.grantChainId = this.grantChainId;
			upData.clientId = this.clientId;
			if (this.postChainId) {
				upData.postChainId = this.postChainId;
				upData.post = this.ukForm.post;
			}
			useUserStore().Login(upData)
				.then((res) => {
					if (res && res.code == 200) {
						// postDialog
						// 获取岗位信息并展示下拉列表
						if (res.data.personId && !this.Simple) {
							this.postPlaceholder = this.$t('请选择岗位单元');
							// 扫码登录
							if (
								this.info.loginType === 'PHONE' ||
								this.info.loginType === 'UKEY'
							) {
								openHosBizDialog({
									component: postDialog,
									_uid: 'postDialog',
									props: {
										personId: res.data.personId,
										postChainId: res.data.postChainId,
										postData: upData,
										name: res.data.name,
										loginSucessHandler: this.loginSucessHandler,
									},
								});
								closeHosBizDialog({
									_uid: 'CADialog',
								});
							}
							// ukey登录
							// if (this.info.loginType === 'UKEY') {
							// 	this.personId = res.data.personId;
							// 	this.postChainId = res.data.postChainId;

							// 	if(this.showPostType) {
							// 			// 下拉选组件
							// 			this.$nextTick(()=> {
							// 				this.$refs.caLoginSelect_post.getPostPage();
							// 			})
							// 		} else {
							// 			// 表格组件
							// 			this.$nextTick(()=> {
							// 				this.$refs.caLoginSelectTable_post.refresh()
							// 			})
							// 		}
							// 	// this.$nextTick(() => {
							// 	// 	this.$refs.people.refresh();
							// 	// });
							// }
						} else {
							this.loginSucessHandler();
						}

						closeHosBizDialog({
							_uid: 'CADialog',
						});
					} else {
						this.$message.error(res.msg);
						closeHosBizDialog({
							_uid: 'CADialog',
						});
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
						let phoneDisplay = err.data.phoneDisplay;
						///弹出层
						this.openTwoAuthDialog(
							grantChainId,
							authType,
							account,
							phoneDisplay,
							grantChainId
						);
					} else {
						///根据返回的编码，从国家化中获取相应的描述
						////公共的错误码的校验
						let errorDesc = getLoginErrorDesc(code, err.msg);
						if (!errorDesc || errorDesc == '') {
							errorDesc = this.$t('短信登录失败，请重新再试！');
						}
						this.$message.error(err.msg);
						closeHosBizDialog({
							_uid: 'CADialog',
						});
					}
				});
		},
		/**
		 * 字符串转二维码方法
		 * @param {String} content 二维码内容
		 * @param {Number} w 生成二维码的宽度
		 * @param {Number} h 生成二维码的高度
		 */
		qrcode(content, w, h) {
			this.$nextTick(() => {
				this.$refs.qrcode.innerHTML = ''; // 清除上一次二维码图片，否则每次生成，图片会累加
				const canvas = document.createElement('canvas');
				QRCode.toCanvas(canvas, content, {
					width: w, // 二维码宽度
					margin: 0,
					color: {
						dark: '#f7382b',
						light: '#ffffff',
					},
				});
				this.$refs.qrcode.appendChild(canvas);
			});
		},
		reset() {
			this.postPlaceholder = this.$t('点击登录按钮后获取岗位单元');
			this.personId = '';
			this.postChainId = '';
			this.ukForm.post = '';
			if (this.$refs.caLoginSelect_post) this.$refs.caLoginSelect_post.clear();
			if (this.$refs.caLoginSelectTable_post)
				this.$refs.caLoginSelectTable_post.clear();
		},
		changePost(id, post) {
			this.ukForm.post = post;
		},
	},
};
</script>
<style lang="scss" scoped>
.mar-t-10 {
	margin-top: 10px;
}
.input-width {
	width: 260px;
	height: 36px;
	&::v-deep .el-input__inner {
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
	&::v-deep .el-form-item {
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
