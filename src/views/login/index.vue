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
		<el-card shadow="never">
			<el-biz-dialog uid="twoAuthDialog" ref="twoAuthDialog" />
			<div
				class="title-container"
				:class="{ 'is-short': systemConfigTitle.length < 6 }"
			>
				<!--欢迎登录,-->
				<h3 class="title">
					<span class="title-welcome-row">
						<span class="title-welcome-text">
							{{ $t('欢迎登录') }}<span v-if="systemConfigTitle !== ''">，</span>
						</span>
						<el-popover
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
							<template #reference>
								<span
									@click="yorn = !yorn"
									class="el-edition"
									:class="{
										'button-yellow': licenseType == 2,
										'button-red': licenseType != 1 && licenseType != 2,
									}"
								>
									{{ licenseEdition }}
								</span>
							</template>
						</el-popover>
						<el-select
							v-if="i18nStatus && isHos"
							class="login-language-select"
							v-model="currLang"
							:placeholder="$t('请选择语言')"
							:data="langOpts"
							@change="languageChange"
							option-label="label"
							option-value="value"
						>
						</el-select>
					</span>
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
				<el-tabs
					type="card"
					v-model="activeType"
					ref="tabs"
					:class="{ 'only-one-authType': authTypeLength == 1 }"
					stretch
				>
					<!--账号登录-->
					<el-tab-pane
						:label="$t('账号登录')"
						name="password"
						style="margin-top: 5px"
						v-if="loginTypeInfo.password.enable"
					>
						<userLogin
							ref="userLoginRef"
							grantType="password"
							:showPostType="loginPostVersion"
							:passwordInfo="loginTypeInfo.password"
							:loginPageInfo="loginPageInfo"
							@loginSucessHandler="loginSucessHandler"
							@forcedJumpSetPassword="forcedJumpSetPassword"
							@openTwoAuthDialog="openTwoAuthDialog"
							:toggleLoading="toggleLoading"
						></userLogin>
					</el-tab-pane>
					<!-- 短信验证码登录-->
					<el-tab-pane
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
					</el-tab-pane>
					<el-tab-pane
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
					</el-tab-pane>
					<!-- <el-tab-pane
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
					<el-tab-pane
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
					</el-tab-pane>
				</el-tabs>
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
					<el-icon v-if="caLoginTypeIconMap[item.loginType]">
						<component :is="caLoginTypeIconMap[item.loginType]" />
					</el-icon>
					{{ item.loginName }}
				</span>
			</div>
		</el-card>
		<!-- 许可证书激活弹框 -->
		<el-biz-dialog
			:title="$t('许可证激活')"
			uid="licenseDialog"
			:append-to-body="true"
			:close-on-click-modal="false"
		></el-biz-dialog>
		<!-- ca 认证弹框 -->
		<el-biz-dialog
			:title="CADialogTitle"
			uid="CADialog"
			width="850px"
			class="ca-biz-dialog"
			:append-to-body="true"
			:close-on-click-modal="false"
		></el-biz-dialog>

		<!-- 选择干纹 扫码登录，微信登录，三方登录 弹窗 -->
		<el-biz-dialog
			:title="postDialogTitle"
			uid="postDialog"
			width="850px"
			class="post-dialog"
			:append-to-body="true"
			:close-on-click-modal="false"
		></el-biz-dialog>
		<!-- 强制修改密码 -->
		<el-biz-dialog
			:title="$t('强制修改密码')"
			uid="forcedJumpSetPassword"
			:append-to-body="true"
			:close-on-click-modal="false"
			width="670px"
			:show-close="false"
		>
		</el-biz-dialog>
		<!-- 二次认证弹框 -->
		<!-- <el-biz-dialog :title="SCDialogTitle" uid="SCDialog" width="850px" height="478px" :append-to-body="true" :close-on-click-modal="false"></el-biz-dialog> -->
	</div>
</template>

<script setup>
import userLogin from './userlogin';
import social from './social';
import licenseDialog from './license-dialog.vue';
import caDialog from './ca.vue';
import secondaryCertification from './secondary-certification.vue';
import { getQueryString, getTopUrl } from '@/utils/base/base-util';
import otplogin from './otplogin';
import scanCode from './scanCode.vue';
import wecomjs from './js/weCom';
import AuthConstant from '@/constant/auth-constant';
import Qs from 'qs';
import setPasswordDialog from '../../components/menu/setPassword.vue';
import {
	getLocale,
	setCurrentLocale,
	getDefaultLocale,
	setDefaultLocale,
} from '@/utils/i18n/i18n-util';
import i18n from '@/i18n';
import { computed, getCurrentInstance, onBeforeMount, ref, watch } from 'vue';
import { openHosBizDialog, setLoginAuthInfo } from '@/composables/useHosBiz';
import { useLoginSessionStore } from '@/stores/loginSession';
import { caLoginTypeIconMap } from '@/utils/login-element-icons';
import { fetchLicenseState } from '@/api/login';
import { fetchOauthInfo } from '@/api/oauth';
import { fetchLangList, fetchLoginPageElements } from '@/api/i18n';

const { proxy } = getCurrentInstance();
const loginSessionStore = useLoginSessionStore();

const isHos = ref(import.meta.env.VITE_APP_THEME_STYLE === '1');
const currLang = ref('');
const title = ref(proxy.$t('医院综合业务操作系统HOS2.0'));
const loginPageInfo = ref({});
const activeType = ref('');
const UItype = ref(import.meta.env.VITE_APP_THEME_STYLE);
const SCDialogTitle = ref(proxy.$t('二次认证'));
const CADialogTitle = ref('');
const yorn = ref(false);
const licenseInfo = ref({});
const licenseType = ref('');
const licenseEdition = ref('');
const clientId = ref('');
const url = ref('');
const loginTypeInfo = ref({
	password: {},
	sms: {},
	ca: {},
	scanCode: {},
});
const postDialogTitle = ref('选择岗位');
const toggleLoading = ref(0);
const systemConfigTitle = ref('');
const authTypeLength = ref(0);
const authInfo = ref({});
const grantChainId = ref('');
const defaultLoginTypeInfo = {
	password: { enable: 0 },
	sms: { enable: 0 },
	ca: { enable: 0, data: [] },
	scanCode: { enable: 0 },
	enableAD: false,
	defaultModel: 'password',
};

function readSessionJSON(key, fallback) {
	try {
		const raw = sessionStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}

function normalizeLoginTypeInfo(raw) {
	const source = raw && typeof raw === 'object' ? raw : {};
	return {
		...defaultLoginTypeInfo,
		...source,
		password: {
			...defaultLoginTypeInfo.password,
			...(source.password || {}),
		},
		sms: {
			...defaultLoginTypeInfo.sms,
			...(source.sms || {}),
		},
		ca: {
			...defaultLoginTypeInfo.ca,
			...(source.ca || {}),
			data: Array.isArray(source?.ca?.data) ? source.ca.data : [],
		},
		scanCode: {
			...defaultLoginTypeInfo.scanCode,
			...(source.scanCode || {}),
		},
		enableAD: Boolean(source.enableAD),
		defaultModel: source.defaultModel || defaultLoginTypeInfo.defaultModel,
	};
}

const loginState = computed(() => ({ ...loginSessionStore.$state }));
const loginTypeDataDTO = computed(
	() => loginState.value.loginTypeDataDTO || readSessionJSON('loginTypeDataDTO', {})
);
const loginPostVersion = computed(
	() => loginState.value.loginPostVersion || sessionStorage.getItem('loginPostVersion') || ''
);
const portalUrl = computed(() => loginState.value.portalUrl || '');
const i18nStatus = computed(() => {
	if (typeof loginState.value.i18nStatus === 'boolean') return loginState.value.i18nStatus;
	return false;
});
const langOpts = computed(() => loginState.value.langOpts || []);

const illustrationStyle = computed(() => {
	if (
		!loginPageInfo.value.hosBackgroundSize ||
		loginPageInfo.value.hosBackgroundFullScreen == true
	)
		return null;
	const percent = Number(loginPageInfo.value.hosBackgroundSize);
	if (Number.isNaN(percent)) return undefined;
	const maxHeight =
		document.querySelector('.el-img-login-bg')?.clientHeight || 0;
	return `width: ${Math.round((650 / 50) * percent)}px;height: ${Math.round((650 / 50) * percent)}px;max-height: ${maxHeight}px;`;
});

async function getSysAuthInfo() {
	try {
		const { code, data } = await fetchOauthInfo();
		if (code == '200') {
			authInfo.value = data ?? {};
			licenseState();
			setLoginAuthInfo(data);
		} else {
			licenseState();
		}
	} catch (e) {
		licenseState();
		console.log(e);
	}
}

const userLoginRef = ref(null);

function getClientId() {
	const redirect = proxy.$route.query.redirect;
	if (redirect) {
		if (redirect.indexOf('oauth/logout') != -1) {
			url.value = redirect.split('service=')[1];
			clientId.value = '';
		} else if (redirect.indexOf('/oauth/authorize') != -1) {
			url.value = redirect.split('redirect_uri=')[1].split('&')[0];
			clientId.value = redirect.split('client_id=')[1].split('&')[0];
		} else {
			url.value = 'all';
			clientId.value = '';
		}
	} else {
		url.value = 'all';
		clientId.value = '';
	}
}

function getAuthTypeLength() {
	const len = Object.keys(loginTypeInfo.value).filter((ele) => {
		return ele != 'ca' && loginTypeInfo.value[ele]?.enable === 1;
	});
	if (loginTypeInfo.value.enableAD === true) len.push(1);
	authTypeLength.value = len.length;
}

function loginTypeFn() {
	const stateLoginType = loginTypeDataDTO.value;
	const sessionLoginType = readSessionJSON('loginTypeDataDTO', {});
	const source =
		stateLoginType && Object.keys(stateLoginType).length
			? stateLoginType
			: sessionLoginType;
	loginTypeInfo.value = normalizeLoginTypeInfo(source);
	loginPageInfo.value = JSON.parse(
		sessionStorage.getItem('loginPageDataDTO') || '{}'
	);
	getAuthTypeLength();
	activeType.value = loginTypeInfo.value.defaultModel;
	systemConfigTitle.value = sessionStorage.getItem('systemConfigTitle') || '';
}

function triggerClick(event) {
	const className = event.target.className;
	let iframeUrl = '';
	if (licenseInfo.value.activedPath.includes('?')) {
		iframeUrl = licenseInfo.value.activedPath + '&language=' + getLocale();
	} else {
		iframeUrl = licenseInfo.value.activedPath + '?language=' + getLocale();
	}
	if (className == 'install-license') {
		openHosBizDialog({
			component: licenseDialog,
			_uid: 'licenseDialog',
			props: {
				status: 'add:',
				iframeUrl: iframeUrl,
			},
		});
	}
	if (className == 'continue') {
		console.log(proxy.$t('继续'));
	}
}

function licenseState() {
	let currentClientId = '';
	const redirect = proxy.$route.query.redirect;
	if (redirect && redirect != '/') {
		currentClientId = new URLSearchParams(redirect).get('client_id');
	} else {
		currentClientId = authInfo.value.client_id;
	}
	if (!currentClientId) {
		return;
	}
	fetchLicenseState({ clientId: currentClientId }).then((res) => {
		if (res && res.code == 200 && res.data) {
			const data = res.data;
			data.licenseText = '';
			licenseInfo.value = data;
			licenseType.value = data.type;
			licenseEdition.value = data.authType;
			if (data.type == 1) {
				licenseInfo.value.licenseText = `${proxy.$t('该产品有效期至')}${
					data.expireDate
				}，${proxy.$t('请')}<span class="install-license">${proxy.$t(
					'安装新许可'
				)}</span>。`;
			}
			if (data.type == 2) {
				licenseInfo.value.licenseText = `${proxy.$t('该产品有效期至')}${
					data.expireDate
				}，${proxy.$t('请')}<span class="install-license">${proxy.$t(
					'安装新许可'
				)}</span>。`;
				licenseEdition.value = `${data.authType}-${proxy.$t('快过期')}`;
				return;
			}
			if (data.type == 31) {
				licenseEdition.value = `${data.authType}-${proxy.$t('非法许可')}`;
				licenseInfo.value.licenseText = `${proxy.$t(
					'该产品尚未安装许可'
				)}，${proxy.$t('请')}<span class="install-license">${proxy.$t(
					'安装许可'
				)}</span>。`;
				return;
			}
			if (data.type == 32) {
				licenseEdition.value = `${data.authType}-${proxy.$t('非法许可')}`;
				licenseInfo.value.licenseText = `${proxy.$t(
					'该产品许可为非法许可'
				)}，${proxy.$t('请')}<span class="install-license">${proxy.$t(
					'更新许可'
				)}</span>。`;
				return;
			}
			if (data.type == 33) {
				licenseEdition.value = `${data.authType}-${proxy.$t('已过期')}`;
				licenseInfo.value.licenseText = `${proxy.$t(
					'该产品有效期已过期'
				)}，${proxy.$t('请')}<span class="install-license">${proxy.$t(
					'更新许可'
				)}</span>。`;
				return;
			}
			if (data.type == 34) {
				licenseEdition.value = `${data.authType}-${proxy.$t('非法许可')}`;
				licenseInfo.value.licenseText = `${proxy.$t('服务器')} ${
					data.macAddress
				} ${proxy.$t('的许可无效')}，${proxy.$t(
					'请'
				)}<span class="install-license">${proxy.$t('更新许可')}</span>。`;
				return;
			}
			if (data.type == 3) {
				licenseEdition.value = `${data.authType}-${proxy.$t('非法许可')}`;
				data.licenseText = `${proxy.$t('该产品许可为非法许可')}，${proxy.$t(
					'请'
				)}<span class="install-license">${proxy.$t('更新许可')}</span>。`;
			}
		}
	})
		.catch(() => {
			// License check is optional; avoid uncaught promise when API fails or is aborted.
		});
}

function openCADialog(row) {
	CADialogTitle.value = '';
	openHosBizDialog({
		component: caDialog,
		_uid: 'CADialog',
		props: {
			info: row,
			status: 'add:',
			CAAUTH: loginTypeInfo.value.ca,
			showPostType: loginPostVersion.value,
			activeType: row.type,
			clientId: clientId.value,
			openTwoAuthDialog,
			loginSucessHandler,
			forcedJumpSetPassword,
			toggleLoading: toggleLoading.value,
		},
	});
}

function loginSucessHandler(toPath) {
	const IP = proxy.$ls.get('IP');
	const MAC = proxy.$ls.get('MAC');
	if (!toPath) {
		let toCustomPath = getQueryString('redirect');
		if (
			(!toCustomPath || toCustomPath.indexOf('/oauth/authorize') == -1) &&
			authInfo.value.redirect_uri
		) {
			proxy.$router.push({ path: '/oauth/authorize', query: authInfo.value });
			return;
		}
		toPath = toCustomPath;
	}
	const query = IP && MAC ? { ip: IP, mac: MAC } : null;
	proxy.$router.push({ path: toPath, query: query });
}

const getOTPLoginData = () => {};
const getSocialData = () => {};
const saveWindow = () => {};

function openTwoAuthDialog(
	grantChainIdValue,
	authType,
	account,
	caData,
	phoneDisplay
) {
	grantChainId.value = grantChainIdValue;
	switch (authType) {
		case 'sms': {
			CADialogTitle.value = '二次认证';
			openHosBizDialog({
				component: secondaryCertification,
				_uid: 'CADialog',
				ref: 'CADialog',
				props: {
					grantChainId: grantChainIdValue,
					account: account,
					phoneDisplay: phoneDisplay,
					getOTPLoginData,
					loginSucessHandler,
				},
			});
			break;
		}
		case 'social': {
			openHosBizDialog({
				component: social,
				_uid: 'twoAuthDialog',
				ref: 'twoAuthDialog',
				props: {
					grantChainId: grantChainIdValue,
					getSocialData,
					saveWindow,
				},
			});
			break;
		}
		case 'ca': {
			CADialogTitle.value = proxy.$t('二次认证');
			openHosBizDialog({
				component: secondaryCertification,
				_uid: 'CADialog',
				ref: 'CADialog',
				props: {
					grantChainId: grantChainIdValue,
					account: account,
					loginSucessHandler,
					caList: caData,
				},
			});
			break;
		}
		default: {
			proxy.$message.error(proxy.$t('不支持此种登录方式'));
		}
	}
}

async function getlangs() {
	try {
		const { data, code } = await fetchLangList();
		if (code == 200) {
			const defaultLang = data.find((item) => {
				return item.isDefault;
			});
			setDefaultLocale(defaultLang.value);
			const cl = getLocale();
			cl ? false : setCurrentLocale(defaultLang.value);
		}
	} catch (error) {
		console.log(error);
	}
}

function languageChange(val) {
	const currentRoute = proxy.$route;
	const currentQuery = { ...currentRoute.query };
	if (currentQuery.language) {
		delete currentQuery.language;
		const newRoute = {
			path: currentRoute.path,
			query: currentQuery,
		};
		proxy.$router.replace(newRoute);
	}

	setCurrentLocale(val);
	proxy.$router.go();
}

async function loginPageElements() {
	const { code, data } = await fetchLoginPageElements('loginPage');
	if (code == '200') {
		i18n.mergeLocaleMessage(currLang.value, data);
	}
}

function forcedJumpSetPassword(res) {
	openHosBizDialog({
		component: setPasswordDialog,
		_uid: 'forcedJumpSetPassword',
		ref: 'forcedJumpSetPassword',
		props: {
			personUuid: res.data,
			msg: res.msg,
			code: res.code,
			callback: closeBtnLoading,
		},
	});
}

function closeBtnLoading() {
	toggleLoading.value += 1;
}

watch(loginTypeDataDTO, () => {
	loginTypeFn();
});

watch(i18nStatus, (val) => {
	if (isHos.value && val) {
		currLang.value = getLocale();
	}
});

onBeforeMount(async () => {
	await getSysAuthInfo();
	loginTypeFn();
});
</script>
<style scoped>
.is-short {
	width: 350px;
}
</style>
<style>
/* .el-login-card .el-input>input {
  height: 45px;
  line-height: 45px;
  background: rgba(65,165,255,.5)!important;
  color: #fff!important;
  border: 1px solid #3b8cd9!important;
  border-radius: 4px;
} */
</style>
