<template>
	<div class="login-box" :class="{ 'language-en': currLang != 'zh' }">
		<div
			class="illustration-box"
			v-if="UItype == 1"
			:class="{
				'illustration-fullscreen': loginPageInfo?.hosBackgroundFullScreen,
			}"
		>
			<img
				v-if="loginPageInfo?.hosBackground"
				:src="loginPageInfo?.hosBackground"
				alt=""
				class="illustration"
				:style="illustrationStyle"
			/>
			<img
				class="illustration"
				v-else
				src="../../assets/images/bg_ill.png"
				alt=""
				:style="illustrationStyle"
			/>
		</div>
		<hos-card shadow="never">
			<hos-biz-dialog uid="twoAuthDialog" ref="twoAuthDialog" />
			<div
				class="title-container"
				:class="{ 'is-short': systemConfigTitle.length < 6 }"
			>
				<!--欢迎登录,-->
				<h3 class="title">
					{{ $t('欢迎登录') }}<span v-if="systemConfigTitle !== ''">，</span>
					<hos-popover
						v-if="licenseInfo?.showLicense"
						placement="top-end"
						ref="dcPopover"
						trigger="manual"
						:title="
							licenseInfo.productionName +
							' ' +
							licenseInfo.productionVersion +
							' ' +
							licenseInfo.authType
						"
						v-model="yorn"
					>
						<div
							style="padding: 0 15px 15px 15px"
							v-html="licenseInfo.licenseText"
							@click="triggerClick"
						></div>
						<span
							slot="reference"
							@click="yorn = !yorn"
							class="hos-edition"
							:class="{
								'button-yellow': licenseType == 2,
								'button-red': licenseType != 1 && licenseType != 2,
							}"
						>
							{{ licenseEdition }}
						</span>
					</hos-popover>
					<hos-select
						v-if="i18nStatus && isHos"
						class="login-language-select"
						v-model="currLang"
						:placeholder="$t('请选择语言')"
						:data="langOpts"
						@change="languageChange"
						option-label="label"
						option-value="value"
					>
					</hos-select>
					<h4 v-if="systemConfigTitle === 'isNull'" class="title-name">
						{{ $t('医院综合业务操作系统HOS2.0') }}
					</h4>
					<span v-else-if="systemConfigTitle.length < 6" class="title-name">{{
						systemConfigTitle
					}}</span>
					<h4 v-else class="title-name">{{ systemConfigTitle }}</h4>
				</h3>
			</div>
			<div class="login-card">
				<hos-tabs
					type="card"
					v-model="activeType"
					ref="tabs"
					:class="{ 'only-one-authType': authTypeLength == 1 }"
					stretch
				>
					<!--账号登录-->
					<hos-tab-pane
						:label="$t('账号登录')"
						name="password"
						style="margin-top: 5px"
						v-if="loginTypeInfo.password.enable"
					>
						<userLogin
							ref="userLogin"
							grantType="password"
							:showPostType="loginPostVersion"
							:passwordInfo="loginTypeInfo.password"
							:loginPageInfo="loginPageInfo"
							@loginSucessHandler="loginSucessHandler"
							@forcedJumpSetPassword="forcedJumpSetPassword"
							@openTwoAuthDialog="openTwoAuthDialog"
							:toggleLoading="toggleLoading"
						></userLogin>
					</hos-tab-pane>
					<!-- 短信验证码登录-->
					<hos-tab-pane
						:label="$t('短信验证码登录')"
						name="sms"
						style="margin-top: 5px"
						v-if="loginTypeInfo.sms.enable"
					>
						<otplogin
							ref="otp"
							:showPostType="loginPostVersion"
							@loginSucessHandler="loginSucessHandler"
							@forcedJumpSetPassword="forcedJumpSetPassword"
							:loginPageInfo="loginPageInfo"
							@openTwoAuthDialog="openTwoAuthDialog"
							:toggleLoading="toggleLoading"
						></otplogin>
					</hos-tab-pane>
					<hos-tab-pane
						:label="$t('扫码登录')"
						name="scanCode"
						style="margin-top: 5px"
						v-if="loginTypeInfo.scanCode.enable"
					>
						<scanCode
							:activeType="activeType"
							:showPostType="loginPostVersion"
							@loginSucessHandler="loginSucessHandler"
							@forcedJumpSetPassword="forcedJumpSetPassword"
						></scanCode>
					</hos-tab-pane>
					<!-- <hos-tab-pane
						:label="$t('企业微信扫码登录')"
						name="weCom"
						style="margin-top: 5px"
						v-if="loginTypeInfo.wecom?.enable"
					>
						<WeCom
							:activeType="activeType"
							:showPostType="loginPostVersion"
							@loginSucessHandler="loginSucessHandler"
							@forcedJumpSetPassword="forcedJumpSetPassword"
							v-if="activeType == 'weCom'"
						></WeCom> -->
					<!-- AD登录 -->
					<hos-tab-pane
						:label="$t('AD')"
						name="ad"
						style="margin-top: 5px"
						v-if="loginTypeInfo.enableAD"
					>
						<userLogin
							ref="adlogin"
							grantType="AD"
							:showPostType="loginPostVersion"
							@loginSucessHandler="loginSucessHandler"
							@forcedJumpSetPassword="forcedJumpSetPassword"
							@openTwoAuthDialog="openTwoAuthDialog"
							:toggleLoading="toggleLoading"
						></userLogin>
					</hos-tab-pane>
				</hos-tabs>
			</div>
			<!-- ca认证 -->
			<div class="ca-box" v-if="loginTypeInfo.ca.enable">
				<div v-if="UItype === '1'" class="other-login">
					<span>{{ $t('其他方式登录') }}</span>
				</div>
				<span
					class="ca-login-icon"
					v-for="(item, index) in loginTypeInfo.ca.data"
					:key="index"
					@click="openCADialog(item)"
				>
					<i class="hos-icom-u-key-login" v-if="item.loginType === 'UKEY'"></i>
					<i
						class="hos-icom-code-scanning-login"
						v-if="item.loginType === 'PHONE'"
					></i>
					<i class="hos-icom-key" v-if="item.loginType === 'PINPHONE'"></i>
					<i
						class="hos-icom-facial-recognition"
						v-if="item.loginType === 'FACE'"
					></i>
					{{ item.loginName }}
				</span>
			</div>
		</hos-card>
		<!-- 许可证书激活弹框 -->
		<hos-biz-dialog
			:title="$t('许可证激活')"
			uid="licenseDialog"
			:append-to-body="true"
			:close-on-click-modal="false"
		></hos-biz-dialog>
		<!-- ca 认证弹框 -->
		<hos-biz-dialog
			:title="CADialogTitle"
			uid="CADialog"
			width="850px"
			class="ca-biz-dialog"
			:append-to-body="true"
			:close-on-click-modal="false"
		></hos-biz-dialog>

		<!-- 选择干纹 扫码登录，微信登录，三方登录 弹窗 -->
		<hos-biz-dialog
			:title="postDialogTitle"
			uid="postDialog"
			width="850px"
			class="post-dialog"
			:append-to-body="true"
			:close-on-click-modal="false"
		></hos-biz-dialog>
		<!-- 强制修改密码 -->
		<hos-biz-dialog
			:title="$t('强制修改密码')"
			uid="forcedJumpSetPassword"
			:append-to-body="true"
			:close-on-click-modal="false"
			width="670px"
			:show-close="false"
		>
		</hos-biz-dialog>
		<!-- 二次认证弹框 -->
		<!-- <hos-biz-dialog :title="SCDialogTitle" uid="SCDialog" width="850px" height="478px" :append-to-body="true" :close-on-click-modal="false"></hos-biz-dialog> -->
	</div>
</template>

<script>
import userLogin from './userlogin';
import social from './social';
import { getQueryString, getTopUrl } from '@/utils/base/base-util';
import { INDEX_MAIN_PAGE_PATH } from '@/store/mutation-types';
import otplogin from './otplogin';
import scanCode from './scanCode.vue';
import wecomjs from './js/weCom';
import AuthConstant from '@/constant/auth-constant';
import Qs from 'qs';
import {
	getLocale,
	setCurrentLocale,
	getDefaultLocale,
	setDefaultLocale,
} from '@/utils/i18n/i18n-util';
import i18n from '@/i18n';
import { mapState } from 'vuex';

export default {
	components: {
		otplogin,
		userLogin,
		social,
		scanCode,
	},
	data() {
		return {
			isHos: process.env.VUE_APP_SIMPLE_ONCE === '1', // 是否为HOS风格
			currLang: '',
			title: this.$t('医院综合业务操作系统HOS2.0'), // 欢迎登录，项目名
			loginPageInfo: {}, // 登录配置信息
			activeType: '', // 当前登录方式 账号密码/短信登录
			UItype: process.env.VUE_APP_SIMPLE_ONCE, // 当前ui样式  hos / 极简
			SCDialogTitle: this.$t('二次认证'), // 二次认证弹框标题
			CADialogTitle: '', // ca 弹框标题
			yorn: false, // 是否显示许可证提示
			licenseInfo: {}, // 许可证信息
			licenseType: '', // 许可证状态
			licenseEdition: '', // 许可证文本
			clientId: '', //请求认证的应用系统客户端id
			url: '',
			loginTypeInfo: {
				password: {},
				sms: {},
				ca: {},
				scanCode: {},
			}, // 所有登陆方式
			postDialogTitle: '选择岗位',
			toggleLoading: 0, // 关闭子组件 登录按钮 loading
			systemConfigTitle: '', // 欢迎语
			authTypeLength: 0, //登录方式数量，为1时不显示tab页签
			authInfo: {},
		};
	},
	computed: {
		...mapState({
			loginTypeDataDTO: (state) => state.login.loginTypeDataDTO,
			loginPostVersion: (state) => state.login.loginPostVersion,
			portalUrl: (state) => state.login.portalUrl,
			i18nStatus: (state) => state.login.i18nStatus,
			langOpts: (state) => state.login.langOpts,
		}),
		illustrationStyle() {
			if (
				!this.loginPageInfo.hosBackgroundSize ||
				this.loginPageInfo.hosBackgroundFullScreen == true
			)
				return null;
			let percent = Number(this.loginPageInfo.hosBackgroundSize);
			if (Number.isNaN(percent)) return undefined;
			let maxHeight = document.querySelector('.hos-img-login-bg').clientHeight;
			return `width: ${Math.round((650 / 50) * percent)}px;height: ${Math.round((650 / 50) * percent)}px;max-height: ${maxHeight}px;`;
		},
	},
	async created() {
		this.getSysAuthInfo();
		this.loginTypeFn();
	},
	watch: {
		loginTypeDataDTO(val) {
			this.loginTypeFn();
		},
		i18nStatus(val) {
			if (this.isHos && val) {
				this.currLang = getLocale();
			}
		},
	},
	methods: {
		async getSysAuthInfo() {
			// 无论oauth.info接口返回结果如何，都调用licenseState
			try {
				const { code, data } = await this.$api('oauth.info');
				if (code == '200') {
					this.authInfo = data;
					this.licenseState();
					this.$store.commit('SET_AUTH_INFO', data);
				} else {
					this.licenseState();
				}
			} catch (e) {
				this.licenseState();
				console.log(e);
			}
		},
		// 获取clientId
		getClientId() {
			//根据认证地址获取租户列表
			let redirect = this.$route.query.redirect;
			if (redirect) {
				if (redirect.indexOf('oauth/logout') != -1) {
					this.url = redirect.split('service=')[1];
					this.clientId = '';
				} else if (redirect.indexOf('/oauth/authorize') != -1) {
					this.url = redirect.split('redirect_uri=')[1].split('&')[0];
					this.clientId = redirect.split('client_id=')[1].split('&')[0];
				} else {
					this.url = 'all';
					this.clientId = '';
				}
			} else {
				this.url = 'all';
				this.clientId = '';
			}
		},
		// 获取登录方式
		loginTypeFn() {
			this.loginTypeInfo = JSON.parse(
				sessionStorage.getItem('loginTypeDataDTO')
			);
			this.loginPageInfo = JSON.parse(
				sessionStorage.getItem('loginPageDataDTO')
			);
			// tab是否显示
			this.getAuthTypeLength();
			// 默认登录方式
			this.activeType = this.loginTypeInfo.defaultModel;
			// 欢迎语
			this.systemConfigTitle = sessionStorage.getItem('systemConfigTitle');
		},
		triggerClick(event) {
			let className = event.target.className;
			let iframeUrl = '';
			if (this.licenseInfo.activedPath.includes('?')) {
				iframeUrl = this.licenseInfo.activedPath + '&language=' + getLocale();
			} else {
				iframeUrl = this.licenseInfo.activedPath + '?language=' + getLocale();
			}
			// 点击安装、更新许可
			if (className == 'install-license') {
				this.$store.commit('OPEN_DIALOG', {
					component: require('./license-dialog.vue').default,
					_uid: 'licenseDialog',
					props: {
						status: 'add:',
						iframeUrl: iframeUrl,
					},
				});
			}
			if (className == 'continue') {
				console.log(this.$t('继续'));
			}
		},
		// 获取许可证信息
		licenseState() {
			let clientId = '',
				redirect = this.$route.query.redirect;
			// 优先采用url连接上的参数，无论对错
			if (redirect && redirect != '/') {
				clientId = new URLSearchParams(redirect).get('client_id');
			} else {
				clientId = this.authInfo.client_id;
			}
			this.$api('licenseState', { clientId: clientId }).then((res) => {
				// console.log(res)
				if (res && res.code == 200) {
					let data = res.data;
					data.licenseText = '';
					this.licenseInfo = data;
					this.licenseType = data.type;
					this.licenseEdition = data.authType;
					if (data.type == 1) {
						this.licenseInfo.licenseText = `${this.$t('该产品有效期至')}${
							data.expireDate
						}，${this.$t('请')}<span class="install-license">${this.$t(
							'安装新许可'
						)}</span>。`;
					}
					if (data.type == 2) {
						this.licenseInfo.licenseText = `${this.$t('该产品有效期至')}${
							data.expireDate
						}，${this.$t('请')}<span class="install-license">${this.$t(
							'安装新许可'
						)}</span>。`;
						this.licenseEdition = `${data.authType}-${this.$t('快过期')}`;
						return;
					}
					// 判断证书不存在
					if (data.type == 31) {
						this.licenseEdition = `${data.authType}-${this.$t('非法许可')}`;
						this.licenseInfo.licenseText = `${this.$t(
							'该产品尚未安装许可'
						)}，${this.$t('请')}<span class="install-license">${this.$t(
							'安装许可'
						)}</span>。`;
						return;
					}
					// ${this.$t('判断证书不合法')}
					if (data.type == 32) {
						this.licenseEdition = `${data.authType}-${this.$t('非法许可')}`;
						this.licenseInfo.licenseText = `${this.$t(
							'该产品许可为非法许可'
						)}，${this.$t('请')}<span class="install-license">${this.$t(
							'更新许可'
						)}</span>。`;
						return;
					}
					// 判断不在效期内
					if (data.type == 33) {
						this.licenseEdition = `${data.authType}-${this.$t('已过期')}`;
						this.licenseInfo.licenseText = `${this.$t(
							'该产品有效期已过期'
						)}，${this.$t('请')}<span class="install-license">${this.$t(
							'更新许可'
						)}</span>。`;
						return;
					}
					// ${this.$t('判断机器无效')}
					if (data.type == 34) {
						this.licenseEdition = `${data.authType}-${this.$t('非法许可')}`;
						this.licenseInfo.licenseText = `${this.$t('服务器')} ${
							data.macAddress
						} ${this.$t('的许可无效')}，${this.$t(
							'请'
						)}<span class="install-license">${this.$t('更新许可')}</span>。`;
						return;
					}
					// 证书不存在或者无效
					if (data.type == 3) {
						this.licenseEdition = `${data.authType}-${this.$t('非法许可')}`;
						data.licenseText = `${this.$t('该产品许可为非法许可')}，${this.$t(
							'请'
						)}<span class="install-license">${this.$t('更新许可')}</span>。`;
						return;
					}
				}
			});
		},
		// ca登录弹框
		openCADialog(row) {
			// this.CADialogTitle = row.loginName
			this.CADialogTitle = '';
			this.$store.commit('OPEN_DIALOG', {
				component: require('./ca.vue').default,
				_uid: 'CADialog',
				props: {
					info: row,
					status: 'add:',
					CAAUTH: this.loginTypeInfo.ca,
					showPostType: this.loginPostVersion,
					activeType: row.type,
					clientId: this.clientId,
					openTwoAuthDialog: this.openTwoAuthDialog,
					loginSucessHandler: this.loginSucessHandler,
					forcedJumpSetPassword: this.forcedJumpSetPassword,
					toggleLoading: this.toggleLoading,
				},
			});
		},
		// 登录成功跳转
		loginSucessHandler(toPath) {
			const IP = this.$ls.get('IP');
			const MAC = this.$ls.get('MAC');
			if (!toPath) {
				let toCustomPath = getQueryString('redirect');
				if (
					(!toCustomPath || toCustomPath.indexOf('/oauth/authorize') == -1) &&
					this.authInfo.redirect_uri
				) {
					this.$router.push({ path: '/oauth/authorize', query: this.authInfo });
					return;
				}
				toPath = toCustomPath;
			}
			const query = IP && MAC ? { ip: IP, mac: MAC } : null;
			this.$router.push({ path: toPath, query: query });
		},
		/**打开二次登录  grantChainId authType account caData 二次认证支持的ca认证方式 phoneDisplay 手机号   grantChainId  二次登录手机号ID*/
		openTwoAuthDialog(grantChainId, authType, account, caData, phoneDisplay) {
			this.grantChainId = grantChainId;
			let windowDialog = null;
			switch (authType) {
				case 'sms': {
					this.CADialogTitle = '二次认证';
					windowDialog = this.$store.commit('OPEN_DIALOG', {
						component: require('./secondary-certification.vue').default,
						_uid: 'CADialog',
						ref: 'CADialog',
						props: {
							grantChainId: grantChainId,
							account: account,
							phoneDisplay: phoneDisplay,
							getOTPLoginData: this.getOTPLoginData,
							loginSucessHandler: this.loginSucessHandler,
						},
					});
					break;
				}
				case 'social': {
					windowDialog = this.$store.commit('OPEN_DIALOG', {
						component: require('./social').default,
						_uid: 'twoAuthDialog',
						ref: 'twoAuthDialog',
						props: {
							grantChainId: grantChainId,
							getSocialData: this.getSocialData,
							saveWindow: this.saveWindow,
						},
					});
					break;
				}
				case 'ca': {
					this.CADialogTitle = this.$t('二次认证');
					windowDialog = this.$store.commit('OPEN_DIALOG', {
						component: require('./secondary-certification').default,
						_uid: 'CADialog',
						ref: 'CADialog',
						props: {
							grantChainId: grantChainId,
							account: account,
							loginSucessHandler: this.loginSucessHandler,
							caList: caData,
						},
					});
					break;
				}
				default: {
					this.$message.error(this.$t('不支持此种登录方式'));
				}
			}
		},
		// 查询语言列表,优先从sessionStorage获取,如果sessionStorage为null,则使用接口default值
		async getlangs() {
			try {
				const { data, code } = await this.$api('getLangs');
				if (code == 200) {
					this.langOpts = data;

					const defaultLang = data.find((item) => {
						return item.isDefault;
					});
					setDefaultLocale(defaultLang.value);
					let cl = getLocale();
					cl ? false : setCurrentLocale(defaultLang.value);
				}
			} catch (error) {
				console.log(error);
			}
		},
		// 切换语言时
		languageChange(val) {
			// this.$router.query
			// 切换语言时清空路由query中的language
			const currentRoute = this.$router.currentRoute;
			const currentQuery = { ...currentRoute.query };
			if (currentQuery.language) {
				delete currentQuery.language;
				const newRoute = {
					path: currentRoute.path,
					query: currentQuery,
				};
				this.$router.replace(newRoute);
			}

			setCurrentLocale(val);
			this.$router.go();
		},
		async loginPageElements() {
			const { code, data } = await this.$api('loginPageElements', {
				moduleCode: 'loginPage',
			});
			if (code == '200') {
				i18n.mergeLocaleMessage(this.currLang, data);
			}
		},
		// 强制修改密码
		forcedJumpSetPassword(res) {
			this.$store.commit('OPEN_DIALOG', {
				component: require('../../components/menu/setPassword.vue').default,
				_uid: 'forcedJumpSetPassword',
				ref: 'forcedJumpSetPassword',
				props: {
					personUuid: res.data,
					msg: res.msg,
					code: res.code,
					callback: this.closeBtnLoading,
				},
			});
		},
		closeBtnLoading() {
			this.toggleLoading += 1;
		},

		getAuthTypeLength() {
			let len = Object.keys(this.loginTypeInfo).filter((ele) => {
				return ele != 'ca' && this.loginTypeInfo[ele]?.enable === 1;
			});
			// ad格式不一样
			if (this.loginTypeInfo.enableAD === true) len.push(1);
			this.authTypeLength = len.length;
		},
	},
};
</script>
<style lang="scss" scoped>
.is-short {
	width: 350px;
}
</style>
<style>
/* .hos-login-card .hos-input>input {
  height: 45px;
  line-height: 45px;
  background: rgba(65,165,255,.5)!important;
  color: #fff!important;
  border: 1px solid #3b8cd9!important;
  border-radius: 4px;
} */
</style>
