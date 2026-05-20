<template>
	<el-container>
		<template v-if="isHosTheme">
			<div class="hos-img-login-bg el-img-login-bg"></div>
			<div class="hos-img-login-content el-img-login-content">
				<el-main class="hos-login-main el-login-main">
					<div class="hos-login-card el-login-card">
						<LoginIndex />
					</div>
				</el-main>
				<el-footer class="login-footer">
					<div>
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
							v-model="currLang"
							class="languageSelect"
							:placeholder="t('请选择语言')"
							@change="languageChange"
						>
							<el-option
								v-for="item in langOpts"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</div>
					<div class="right-group-box"></div>
				</div>
				<div class="simple-login-mid">
					<el-carousel trigger="click" height="100%">
						<el-carousel-item
							v-for="item in carouselImage"
							:key="item.sort"
						>
							<el-image
								:src="item.login_back_file_id"
								style="width: 100%; height: 100%"
							/>
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
		<db-dialog v-if="dbDialogVisible" />
	</el-container>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LoginIndex from '@/views/login/index.vue'
import dbDialog from '@/components/DHCWebBrowser-dialog/index.vue'
import UserConstant from '@/constant/user-constant'
import { returnGlobalValue } from '@/utils'
import {
	getLocale,
	setCurrentLocale,
	setDefaultLocale,
} from '@/utils/i18n/i18n-util'
import i18n from '@/i18n'
import { ls } from '@/utils/ls'
import { loginApi } from '@/api/login'
import { i18nApi } from '@/api/i18n'
import { useDeviceStore } from '@/stores/device'
import { useI18nStore } from '@/stores/i18n'
import { useUserStore } from '@/stores/user'
import {
	setLoginI18nList,
	setLoginPageStyle,
	setLoginPortalUrl,
	setLoginPostVersion,
} from '@/composables/useHosBiz'
import loginBg01 from '@/assets/images/login/01.png'
import loginBg02 from '@/assets/images/login/02.png'
import loginBg03 from '@/assets/images/login/03.png'
import type {
	ApiResult,
	CarouselSlide,
	LangOption,
	LoginConfigData,
	LoginPageDataDTO,
	LoginTypeDataDTO,
} from '@/types/login-layout'

const defaultCarouselImage: CarouselSlide[] = [
	{ sort: 1, login_back_file_id: loginBg01 },
	{ sort: 2, login_back_file_id: loginBg02 },
	{ sort: 3, login_back_file_id: loginBg03 },
]

const { t } = useI18n()
const router = useRouter()
const deviceStore = useDeviceStore()
const i18nStore = useI18nStore()
const userStore = useUserStore()

const isHosTheme = computed(
	() => import.meta.env.VITE_APP_THEME_STYLE === '1',
)
const carouselImage = ref<CarouselSlide[]>([...defaultCarouselImage])
const loginPageDataDTO = ref<LoginPageDataDTO>({})
const dbDialogVisible = ref(false)
const langOpts = ref<LangOption[]>([])
const currLang = ref(getLocale())
const i18nStatus = ref(false)
const showLoginDeviceInfo = ref(false)
const localIp = ref('')
const localMac = ref('')

function hideLoginLoadingMask() {
	const mask = document.querySelector<HTMLElement>('.login-loading-mask')
	if (mask) mask.style.display = 'none'
}

function initLoginDeviceInfo() {
	showLoginDeviceInfo.value = !!returnGlobalValue('showLoginDeviceInfo')
	const legacyIp = String(ls.get(UserConstant.IP) ?? '')
	const legacyMac = String(ls.get(UserConstant.Mac) ?? '')
	const legacyHostName = String(ls.get(UserConstant.HostName) ?? '')

	if (legacyIp || legacyMac || legacyHostName) {
		deviceStore.setDeviceInfo({
			ip: legacyIp,
			mac: legacyMac,
			hostName: legacyHostName,
		})
	}

	localIp.value = deviceStore.ip || legacyIp
	localMac.value = deviceStore.mac || legacyMac
}

async function fetchI18nOpen() {
	const res = await i18nApi.fetchI18nIsOpen()
	if (res.code == '200' && res.data != null) {
		i18nStatus.value = Boolean(res.data)
		i18nStore.setI18nStatus(i18nStatus.value)
		if (i18nStatus.value) {
			await fetchLangs()
		}
	}
}

async function fetchLangs() {
	try {
		const res = await i18nApi.fetchLangList()
		if (res.code != 200 || !Array.isArray(res.data)) return

		langOpts.value = res.data
		setLoginI18nList(res.data)

		const defaultLang = res.data.find((item) => item.isDefault)
		if (defaultLang?.value) {
			setDefaultLocale(defaultLang.value)
		}
		currLang.value = getLocale()
		if (!getLocale() && defaultLang?.value) {
			setCurrentLocale(defaultLang.value)
		}
		await fetchLoginPageElements()
	} catch (error) {
		console.log(error)
	}
}

async function fetchLoginPageElements() {
	const res = await i18nApi.fetchLoginPageElements('loginPage')
	if (res.code == '200' && res.data) {
		i18n.global.mergeLocaleMessage(currLang.value, res.data)
	}
}

function languageChange(val: string) {
	const currentQuery = { ...router.currentRoute.value.query }
	if (currentQuery.language) {
		delete currentQuery.language
		router.replace({
			path: router.currentRoute.value.path,
			query: currentQuery,
		})
	}
	setCurrentLocale(val)
	router.go(0)
}

function getDefaultLoginTypeInfo(): LoginTypeDataDTO {
	return {
		isFake: true,
		password: {
			accountList: null,
			accountInfo: '用户名、手机号、邮箱、身份证号、人员唯一标识',
			enable: 1,
		},
		sms: { enable: 0 },
		scanCode: { enable: 0 },
		defaultModel: 'password',
		third: { enable: 0, data: null },
		ca: { data: [], enable: 0, idList: null },
		authentication: null,
		enableAD: false,
	}
}

function persistLoginType(loginTypeInfo: LoginTypeDataDTO) {
	const strObj = JSON.stringify(loginTypeInfo)
	sessionStorage.setItem('loginTypeDataDTO', strObj)
	userStore.setLoginType(loginTypeInfo as Record<string, unknown>)
}

function applyLoginPageData(dto: LoginPageDataDTO) {
	loginPageDataDTO.value = dto
	carouselImage.value =
		dto.easyBackGround?.length ? dto.easyBackGround : [...defaultCarouselImage]
	sessionStorage.setItem('loginPageDataDTO', JSON.stringify(dto))
	setLoginPageStyle(dto as Record<string, unknown>)

	document.title =
		dto.easyBrowserTabName ||
		dto.hosBrowserTabName ||
		t('基础开发框架')

	const logoUrl = dto.easyBrowserTabLogo || dto.hosBrowserTabLogo
	if (logoUrl) {
		let link =
			document.querySelector<HTMLLinkElement>("link[rel*='icon']") ||
			document.createElement('link')
		link.rel = 'shortcut icon'
		link.href = logoUrl
		document.head.appendChild(link)
	}
}

function applyLoginConfig(res: ApiResult<LoginConfigData>) {
	if (!res || res.code != 200 || !res.data) return

	const data = res.data
	if (data.functionalVersion != null) {
		setLoginPostVersion(String(data.functionalVersion))
	}
	if (data.portalUrl != null) {
		setLoginPortalUrl(String(data.portalUrl))
	}
	hideLoginLoadingMask()

	if (data.loginPageDataDTO) {
		applyLoginPageData(data.loginPageDataDTO)
	}

	if (data.systemConfigTitle === null || data.systemConfigTitle === undefined) {
		sessionStorage.setItem('systemConfigTitle', 'isNull')
	} else {
		sessionStorage.setItem('systemConfigTitle', String(data.systemConfigTitle))
	}

	if (data.loginTypeDataDTO) {
		persistLoginType(data.loginTypeDataDTO)
	} else {
		persistLoginType(getDefaultLoginTypeInfo())
	}
}

function fetchLoginConfig() {
	const pageType = isHosTheme.value ? 'hos' : 'easy'
	loginApi
		.fetchLoginConfig(pageType)
		.then((res) => applyLoginConfig(res))
		.catch(() => {
			persistLoginType(getDefaultLoginTypeInfo())
		})
}

onBeforeMount(async () => {
	await fetchI18nOpen()
	fetchLoginConfig()
	initLoginDeviceInfo()
})

onMounted(() => {
	document.body.classList.add('userLayout')
	setTimeout(() => {
		initLoginDeviceInfo()
	}, 1500)
})

onBeforeUnmount(() => {
	document.body.classList.remove('userLayout')
})
</script>

<style scoped>
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
</style>
