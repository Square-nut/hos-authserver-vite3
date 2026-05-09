<template>
	<el-container>
		<template v-if="isSimple == 1">
			<div class="el-img-login-bg"></div>
			<div class="el-img-login-content">
				<!-- <el-header> </el-header> -->
				<el-main class="el-login-main">
					<div class="el-login-card">
						<!-- <route-view></route-view> -->
						<LoginIndex />
					</div>
				</el-main>
				<el-footer class="login-footer">
					<div>
						<!-- TODO 英文翻译不正确 -->
						<span class="foot-font">{{
							loginPageDataDTO.hosCopyrightInformation
						}}</span>
					</div>
				</el-footer>
			</div>
		</template>
		<template v-else>
			<el-main class="login-simple-el-main">
				<div class="header-four-box">
					<div class="left-group-box"></div>
					<div class="center">
						<span>{{ loginPageDataDTO.easyTitle }}</span>
					</div>
					<div class="languangeChange">
						<el-select
							v-if="i18nStatus"
							class="languageSelect"
							v-model="currLang"
							:placeholder="$t('请选择语言')"
							:data="langOpts"
							@change="languageChange"
							option-label="label"
							option-value="value"
						>
						</el-select>
					</div>
					<div class="right-group-box"></div>
				</div>
				<div class="simple-login-mid">
					<el-carousel trigger="click" height="100%">
						<el-carousel-item v-for="item in carouselImage" :key="item.sort">
							<el-image
								:src="item.login_back_file_id"
								style="width: 100%; height: 100%"
							></el-image>
						</el-carousel-item>
					</el-carousel>
					<div class="simple-login-card">
						<LoginIndex />
					</div>
				</div>
			</el-main>
			<el-footer class="simple-footer">
				<div class="simple-com-logo"></div>
				<span class="simple-foot-font">
					{{ loginPageDataDTO.easyCopyrightInformation }}
				</span>
			</el-footer>
		</template>
		<div v-if="showLoginDeviceInfo" class="login-layout-device-info">
			<span>本机IP: {{ localIp || '--' }}</span>
			<span>MAC: {{ localMac || '--' }}</span>
		</div>
		<!-- 下载或开启医为客户端 SZWW -->
		<db-dialog v-if="dbDialogVisible"></db-dialog>
		<!-- 下载或开启医为客户端 EZWW -->
	</el-container>
</template>

<script setup>
import LoginIndex from '@/views/login/index.vue';
import {
	getCurrentInstance,
	onBeforeMount,
	onBeforeUnmount,
	onMounted,
	ref,
} from 'vue';
import dbDialog from '@/components/DHCWebBrowser-dialog/index.vue'; //医为客户端弹窗
import CmdShell from '@/utils/websys.addins.js'; //医为客户端检测插件
import UserConstant from '@/constant/user-constant.js';
import { returnGlobalValue } from '@/utils';
import {
	getLocale,
	setCurrentLocale,
	getDefaultLocale,
	setDefaultLocale,
} from '@/utils/i18n/i18n-util';
import i18n from '@/i18n';
import { useDeviceStore } from '@/stores/device';
import { useI18nStore } from '@/stores/i18n';
import { useUserStore } from '@/stores/user';
import {
	setLoginI18nList,
	setLoginPageStyle,
	setLoginPortalUrl,
	setLoginPostVersion,
} from '@/composables/useHosBiz';
import loginBg01 from '@/assets/images/login/01.png';
import loginBg02 from '@/assets/images/login/02.png';
import loginBg03 from '@/assets/images/login/03.png';

const defaultCarouselImage = [
	{
		sort: 1,
		login_back_file_id: loginBg01,
	},
	{
		sort: 2,
		login_back_file_id: loginBg02,
	},
	{
		sort: 3,
		login_back_file_id: loginBg03,
	},
];

const { proxy } = getCurrentInstance();
const deviceStore = useDeviceStore();
const i18nStore = useI18nStore();
const userStore = useUserStore();

const isSimple = ref(import.meta.env.VITE_APP_THEME_STYLE);
const carouselImage = ref([...defaultCarouselImage]);
const loginPageDataDTO = ref({});
const DHCWebBrowserStatus = ref(''); //医为客户端状态
const dbDialogVisible = ref(false);

// 多语言
const langOpts = ref([]);
const currLang = ref(getLocale());
const i18nStatus = ref(false); // 国际化状态
const showLoginDeviceInfo = ref(false);
const localIp = ref('');
const localMac = ref('');

function initLoginDeviceInfo() {
	showLoginDeviceInfo.value = !!returnGlobalValue('showLoginDeviceInfo');
	const legacyIp = proxy.$ls.get(UserConstant.IP) || '';
	const legacyMac = proxy.$ls.get(UserConstant.Mac) || '';
	const legacyHostName = proxy.$ls.get(UserConstant.HostName) || '';

	// 兼容历史 vue-ls 数据，并同步到 Pinia 持久化状态
	if (legacyIp || legacyMac || legacyHostName) {
		deviceStore.setDeviceInfo({
			ip: legacyIp,
			mac: legacyMac,
			hostName: legacyHostName,
		});
	}

	localIp.value = deviceStore.ip || legacyIp;
	localMac.value = deviceStore.mac || legacyMac;
}

async function isOpen() {
	const { code, data } = await proxy.$api('isOpen');
	if (code == '200') {
		i18nStatus.value = data;
		i18nStore.setI18nStatus(data);
		// 开启国际化，获取语言列表和页面翻译
		if (i18nStatus.value) {
			getlangs();
		}
	}
}

// 查询语言列表,优先从sessionStorage获取,如果sessionStorage为null,则使用接口default值
async function getlangs() {
	try {
		const { data, code } = await proxy.$api('getLangs');
		if (code == 200) {
			langOpts.value = data;

			setLoginI18nList(data);

			const defaultLang = data.find((item) => {
				return item.isDefault;
			});
			setDefaultLocale(defaultLang.value);
			currLang.value = getLocale();

			const cl = getLocale();
			cl ? false : setCurrentLocale(defaultLang.value);

			loginPageElements();
		}
	} catch (error) {
		console.log(error);
	}
}

async function loginPageElements() {
	const { code, data } = await proxy.$api('loginPageElements', {
		moduleCode: 'loginPage',
	});
	if (code == '200') {
		i18n.mergeLocaleMessage(currLang.value, data);
	}
}

// 切换语言时
function languageChange(val) {
	// 切换语言时清空路由query中的language
	const routeValue = proxy.$router.currentRoute;
	const currentRoute = routeValue?.value || routeValue;
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

function getDefaultLoginTypeInfo() {
	return {
		isFake: true,
		password: {
			accountList: null,
			accountInfo: '用户名、手机号、邮箱、身份证号、人员唯一标识',
			enable: 1,
		},
		sms: {
			enable: 0,
		},
		scanCode: {
			enable: 0,
		},
		defaultModel: 'password',
		third: {
			enable: 0,
			data: null,
		},
		ca: {
			data: [],
			enable: 0,
			idList: null,
		},
		authentication: null,
		enableAD: false,
	};
}

function configPageType() {
	const upData = { pageType: isSimple.value == 1 ? 'hos' : 'easy' };
	proxy
		.$api('getLoginConfig', upData)
		.then((res) => {
			if (res && res.code == 200) {
				setLoginPostVersion(res.data.functionalVersion);
				setLoginPortalUrl(res.data.portalUrl);
				document.querySelector('.login-loading-mask').style.display = 'none';
				if (res.data.loginPageDataDTO) {
					loginPageDataDTO.value = res.data.loginPageDataDTO;
					carouselImage.value =
						loginPageDataDTO.value.easyBackGround &&
						loginPageDataDTO.value.easyBackGround.length
							? loginPageDataDTO.value.easyBackGround
							: [...defaultCarouselImage];
					const strObj = JSON.stringify(loginPageDataDTO.value);
					sessionStorage.setItem('loginPageDataDTO', strObj);
					setLoginPageStyle(loginPageDataDTO.value);
					// 修改浏览器的标题和图标
					document.title =
						loginPageDataDTO.value.easyBrowserTabName ||
						loginPageDataDTO.value.hosBrowserTabName ||
						proxy.$t('基础开发框架');
					if (
						loginPageDataDTO.value.easyBrowserTabLogo ||
						loginPageDataDTO.value.hosBrowserTabLogo
					) {
						let link = null;
						link =
							document.querySelector("link[rel*='icon']") ||
							document.createElement('link');
						link.ref = 'image/x-icon';
						link.rel = 'shortcut icon';
						link.href =
							loginPageDataDTO.value.easyBrowserTabLogo ||
							loginPageDataDTO.value.hosBrowserTabLogo;
						document.getElementsByTagName('head')[0].appendChild(link);
					}
				}
				// 处理标题
				if (
					res.data.systemConfigTitle === null ||
					res.data.systemConfigTitle === undefined
				) {
					sessionStorage.setItem('systemConfigTitle', 'isNull');
				} else {
					sessionStorage.setItem(
						'systemConfigTitle',
						res.data.systemConfigTitle
					);
				}
				if (res.data.loginTypeDataDTO) {
					const loginTypeInfo = res.data.loginTypeDataDTO;
					const strObj = JSON.stringify(loginTypeInfo);
					sessionStorage.setItem('loginTypeDataDTO', strObj);
					userStore.setLoginType(loginTypeInfo);
				} else {
					// fix by 2024.05.10 需求序号	4425543 需求名称	登录界面初始化如果只是后台的服务有问题，应该把登录界面显示出来，而不是一片空白，否则用户的体验不是很好
					const loginTypeInfo = getDefaultLoginTypeInfo();
					const strObj = JSON.stringify(loginTypeInfo);
					sessionStorage.setItem('loginTypeDataDTO', strObj);
					userStore.setLoginType(loginTypeInfo);
				}
			}
		})
		.catch(() => {
			// fix by 2024.05.10 需求序号	4425543 需求名称	登录界面初始化如果只是后台的服务有问题，应该把登录界面显示出来，而不是一片空白，否则用户的体验不是很好
			const loginTypeInfo = getDefaultLoginTypeInfo();
			const strObj = JSON.stringify(loginTypeInfo);
			userStore.setLoginType(loginTypeInfo);
			sessionStorage.setItem('loginTypeDataDTO', strObj);
		});
}

onBeforeMount(async () => {
	await isOpen();
	configPageType();
	initLoginDeviceInfo();
});

onMounted(() => {
	document.body.classList.add('userLayout');
	// IP/MAC may be written asynchronously after page initialized.
	setTimeout(() => {
		initLoginDeviceInfo();
	}, 1500);
});

onBeforeUnmount(() => {
	document.body.classList.remove('userLayout');
});
</script>

<style lang="scss" scoped>
.el-header {
	margin-bottom: 48px;
}
.el-system-name {
	padding-top: 25px;
	font-size: 32px;
	font-family: Microsoft YaHei;
	font-weight: bold;
	color: #000000;
}
img {
	width: 550px;
	height: 430px;
	opacity: 1;
	border-radius: 0px;
}
.el-login-main {
	display: flex;
	height: 502px;
	opacity: 1;
	border-radius: 0px;
	.el-img-login {
		padding-left: 166px;
	}
	.el-login-card {
		.el-card {
			width: 350px;
			height: 375px;
			opacity: 1;
			border-radius: 0px;
		}
	}
}

.login-layout-device-info {
	position: fixed;
	right: 16px;
	bottom: 10px;
	z-index: 1001;
	display: flex;
	gap: 10px;
	align-items: center;
	padding: 0;
	font-size: 18px;
	line-height: 20px;
	color: #9da7b6;
	background: transparent;
}
// @import "../../assets/css/login.css";
</style>
