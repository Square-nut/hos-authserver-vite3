<template>
	<el-container>
		<!-- Hos 主题 ($theme == 1) -->
		<template v-if="uiTheme === 1">
			<div class="hos-img-login-bg el-img-login-bg"></div>
			<div class="hos-img-login-content el-img-login-content">
				<el-main class="hos-login-main el-login-main">
					<div
						class="hos-login-company-info"
						:style="hosCompanyInfoStyle"
					>
						<img
							v-if="loginStyle.companyLogo?.login_back_file_id"
							class="login-company-logo dib mid pr10"
							:src="loginStyle.companyLogo.login_back_file_id"
							alt=""
						/>
						<span class="dib mid">{{ loginStyle.companyName }}</span>
					</div>
					<div class="hos-login-card el-login-card">
						<LoginIndex />
					</div>
				</el-main>
				<el-footer
					v-if="loginStyle.copyrightInformationSwitch == 1"
					class="login-footer"
				>
					<template
						v-for="(item, index) in copyrightList"
						:key="'hos-footer-' + index"
					>
						<span
							v-if="item.type == 'String'"
							class="footer-item span"
							:class="{ newline: item.newline }"
							>{{ item.content }}</span
						>
						<img
							v-if="item.type == 'Trademark' && item.actived == true"
							class="footer-item img pl10"
							:class="{ newline: item.newline }"
							:src="getCopyrightImage(item)"
							alt=""
						/>
					</template>
				</el-footer>
			</div>
		</template>

		<!-- 简约主题 ($theme == 0) -->
		<template v-else-if="uiTheme === 0">
			<el-main
				class="login-simple-el-main login-simple-hos-main"
				:class="{ 'is-feature': loginStyle.showPersonalization == 1 }"
			>
				<div class="header-four-box">
					<div class="left-group-box"></div>
					<div class="center" :style="companyInfoStyle">
						<img
							v-if="loginStyle.companyLogo?.login_back_file_id"
							class="login-company-logo dib mid"
							:src="loginStyle.companyLogo.login_back_file_id"
							alt=""
						/>
						<span class="dib mid">{{
							loginStyle.companyName || t('东华医为数字化医院')
						}}</span>
					</div>
					<div class="languangeChange">
						<el-select
							v-if="isI18n && loginStyle.showI18n == 1"
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
					<el-carousel
						trigger="click"
						:height="
							loginStyle.showPersonalization == 1 ? '555px' : '672px'
						"
						:interval="5000"
					>
						<el-carousel-item
							v-for="item in carouselImage"
							:key="item.sort"
							:style="carouselItemStyle(item)"
						/>
					</el-carousel>
					<div
						v-if="loginStyle.easyUserInfo == true"
						id="login-user-info-wrap"
						class="login-user-info-wrap"
						v-html="userInfoHtml"
					></div>
					<div class="simple-login-card">
						<LoginIndex />
					</div>
				</div>
				<FeatureList
					v-if="loginStyle.showPersonalization == 1"
					:data="loginStyle.personalization || []"
				/>
			</el-main>
			<el-footer
				v-if="loginStyle.copyrightInformationSwitch == 1"
				class="simple-footer"
			>
				<template
					v-for="(item, index) in copyrightList"
					:key="'simple-footer-' + index"
				>
					<span
						v-if="item.type == 'String' && item.actived == true"
						class="footer-item span"
						:class="{ newline: item.newline }"
						>{{ item.content }}</span
					>
					<img
						v-if="item.type == 'Trademark' && item.actived == true"
						class="footer-item img"
						:class="{ newline: item.newline }"
						:src="getCopyrightImage(item)"
						alt=""
					/>
				</template>
			</el-footer>
		</template>

		<!-- 纯净主题 ($theme == 2) -->
		<template v-else-if="uiTheme === 2">
			<el-main
				class="login-pure-hos-main login-pure-el-main"
				:class="{ 'is-feature': loginStyle.showPersonalization == 1 }"
			>
				<div class="header-four-box">
					<div class="left-group-box"></div>
					<div class="center" :style="companyInfoStyle">
						<img
							v-if="loginStyle.companyLogo?.login_back_file_id"
							class="login-company-logo dib mid"
							:src="loginStyle.companyLogo.login_back_file_id"
							alt=""
						/>
						<span class="dib mid">{{
							loginStyle.companyName || t('东华医为数字化医院')
						}}</span>
					</div>
					<div class="languangeChange">
						<el-select
							v-if="loginStyle.showI18n == 1"
							v-model="currLang"
							class="languageSelect"
							popper-class="login-language-select-popper"
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
				<div class="pure-login-mid">
					<el-carousel trigger="click" height="100%" :interval="5000">
						<el-carousel-item
							v-for="item in carouselImage"
							:key="item.sort"
							:style="pureCarouselItemStyle(item)"
						/>
					</el-carousel>
					<div class="pure-login-card">
						<LoginIndex />
					</div>
				</div>
				<FeatureList
					v-if="loginStyle.showPersonalization == 1"
					:data="loginStyle.personalization || []"
				/>
			</el-main>
			<el-footer
				v-if="loginStyle.copyrightInformationSwitch == 1"
				class="pure-footer"
			>
				<template
					v-for="(item, index) in copyrightList"
					:key="'pure-footer-' + index"
				>
					<span
						v-if="item.type == 'String' && item.actived == true"
						class="footer-item span"
						:class="{ newline: item.newline }"
						>{{ item.content }}</span
					>
					<img
						v-if="item.type == 'Trademark' && item.actived == true"
						class="footer-item img"
						:class="{ newline: item.newline }"
						:src="getCopyrightImage(item)"
						alt=""
					/>
				</template>
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
import {
	computed,
	onBeforeMount,
	onBeforeUnmount,
	onMounted,
	provide,
	ref,
} from 'vue'
import { useI18n } from 'vue-i18n'
import LoginIndex from '@/views/login/index.vue'
import FeatureList from '@/components/feature-list.vue'
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
import { useLoginSessionStore } from '@/stores/loginSession'
import {
	setLoginI18nList,
	setLoginPageStyle,
	setLoginPortalUrl,
	setLoginPostVersion,
} from '@/composables/useHosBiz'
import {
	enrichLoginPageDto,
	getFaviconHref,
	getSlideImageUrl,
	normalizeCarousel,
	resolveUiTheme,
} from '@/layout/login-layout-utils'
import type {
	ApiResult,
	CarouselSlide,
	CopyrightItem,
	LangOption,
	LoginConfigData,
	LoginPageDataDTO,
	LoginTypeDataDTO,
} from '@/types/login-layout'

const { t } = useI18n()
const deviceStore = useDeviceStore()
const i18nStore = useI18nStore()
const userStore = useUserStore()
const loginSessionStore = useLoginSessionStore()

const uiTheme = ref(resolveUiTheme())
const loginPageDataDTO = ref<LoginPageDataDTO>({})
const loginStyle = computed(() => loginPageDataDTO.value)
const copyrightList = ref<CopyrightItem[]>([])
const carouselImage = ref<CarouselSlide[]>(normalizeCarousel())
const dbDialogVisible = ref(false)
const userInfoHtml = ref('')
const isChangeLanguage = ref(false)
const currLang = ref(getLocale())
const showLoginDeviceInfo = ref(false)
const localIp = ref('')
const localMac = ref('')

const isI18n = computed(() => i18nStore.i18nStatus)
const langOpts = computed(
	() => (loginSessionStore.langOpts as LangOption[]) || [],
)

const hosCompanyInfoStyle = computed(() => {
	const layout = loginStyle.value.layout || 'left'
	if (layout === 'left') return { left: '111px' }
	if (layout === 'center') return { left: '50%', transform: 'translateX(-50%)' }
	return { right: '111px' }
})

const companyInfoStyle = computed(() => {
	const layout = loginStyle.value.layout || 'center'
	let posRight = ''
	if (isI18n.value && loginStyle.value.showI18n == 1 && layout === 'right') {
		posRight = 'margin-right: 128px;'
	}
	return `text-align:${layout};${posRight}`
})

function getCopyrightImage(item: CopyrightItem): string {
	const content = item.content
	if (content && typeof content === 'object' && 'login_back_file_id' in content) {
		return content.login_back_file_id || ''
	}
	return ''
}

function carouselItemStyle(item: CarouselSlide) {
	const url = getSlideImageUrl(item)
	return {
		display: item.actived === false ? 'none' : 'inline-block',
		backgroundImage: url ? `url(${url})` : undefined,
	}
}

function pureCarouselItemStyle(item: CarouselSlide) {
	const url = getSlideImageUrl(item)
	return {
		display: item.actived === false ? 'none' : 'inline-block',
		backgroundImage: url ? `url(${url})` : undefined,
		backgroundRepeat: 'repeat-x',
		backgroundPosition: 'center',
		backgroundSize: 'contain',
	}
}

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

function updateRouterQuery() {
	const url = new URL(window.location.href)
	const params = new URLSearchParams(url.search)
	params.delete('language')
	url.search = params.toString()
	window.history.pushState({}, '', url.toString())
}

async function fetchI18nOpen() {
	const res = await i18nApi.fetchI18nIsOpen()
	if ((res.code == 200 || res.code == '200') && res.data != null) {
		const open = Boolean(res.data)
		i18nStore.setI18nStatus(open)
		if (open) {
			await fetchLangs()
		}
	}
}

async function fetchLangs() {
	try {
		const res = await i18nApi.fetchLangList()
		if (res.code != 200 && res.code != '200') return
		if (!Array.isArray(res.data)) return

		setLoginI18nList(res.data)
		const defaultLang = res.data.find((item) => item.isDefault)
		if (defaultLang?.value) {
			setDefaultLocale(defaultLang.value)
		}
		currLang.value = getLocale()
		if (!getLocale() && defaultLang?.value) {
			setCurrentLocale(defaultLang.value)
		}
		await mergeLoginPageElements(getLocale())
	} catch (error) {
		console.log(error)
	}
}

async function mergeLoginPageElements(language?: string) {
	const lang = language || getLocale()
	if (!lang) return
	const res = await i18nApi.fetchLoginPageElements('loginPage')
	if ((res.code == 200 || res.code == '200') && res.data) {
		i18n.global.mergeLocaleMessage(lang, res.data)
	}
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
	sessionStorage.setItem('loginTypeDataDTO', JSON.stringify(loginTypeInfo))
	userStore.setLoginType(loginTypeInfo as Record<string, unknown>)
}

function applyLoginPageData(raw: LoginPageDataDTO) {
	const dto = enrichLoginPageDto(raw)
	loginPageDataDTO.value = dto
	userStore.setLoginStyle(dto as Record<string, unknown>)
	setLoginPageStyle(dto as Record<string, unknown>)

	copyrightList.value = Array.isArray(dto.copyrightInformationInfo)
		? dto.copyrightInformationInfo
		: []
	carouselImage.value = normalizeCarousel(dto.backGround)

	sessionStorage.setItem('loginPageDataDTO', JSON.stringify(dto))

	document.title = dto.browserTabName || t('基础开发框架')
	const favicon = getFaviconHref(dto.browserTabLogo)
	if (favicon) {
		let link =
			document.querySelector<HTMLLinkElement>("link[rel*='icon']") ||
			document.createElement('link')
		link.rel = 'shortcut icon'
		link.href = favicon
		document.head.appendChild(link)
	}
}

function applyLoginConfig(res: ApiResult<LoginConfigData>) {
	if (!res || (res.code != 200 && res.code != '200') || !res.data) return

	const data = res.data
	if (data.functionalVersion != null) {
		const version = String(data.functionalVersion)
		ls.set('hos_login_post_type', version)
		setLoginPostVersion(version)
	}
	const portal =
		returnGlobalValue('VUE_APP_PORTAL_URL') ||
		data.portalUrl ||
		''
	if (portal) {
		setLoginPortalUrl(String(portal))
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

/** 与旧版 configPageType 同名，供 index inject 调用 */
function configPageType() {
	const pageType = uiTheme.value === 1 ? 'hos' : 'easy'
	loginApi
		.fetchLoginConfig(pageType)
		.then((res) => applyLoginConfig(res))
		.catch(() => {
			persistLoginType(getDefaultLoginTypeInfo())
		})
}

function init() {
	currLang.value = getLocale()
	configPageType()
}

async function languageChange(val: string) {
	setCurrentLocale(val)
	updateRouterQuery()
	currLang.value = val
	i18nStore.setLanguage(val)
	isChangeLanguage.value = true
	await mergeLoginPageElements(val)
	init()
}

function onLoginUserInfoMessage(event: MessageEvent) {
	const data = event.data as { type?: string; data?: string }
	if (data?.type === 'login-receive-user-info') {
		userInfoHtml.value = data.data || ''
	}
}

provide('loginLayoutThis', {
	configPageType,
	languageChange,
	isChangeLanguage,
})

onBeforeMount(async () => {
	await fetchI18nOpen()
	init()
	initLoginDeviceInfo()
})

onMounted(() => {
	document.body.classList.add('userLayout')
	window.addEventListener('message', onLoginUserInfoMessage)
	setTimeout(() => {
		initLoginDeviceInfo()
	}, 1500)
})

onBeforeUnmount(() => {
	document.body.classList.remove('userLayout')
	window.removeEventListener('message', onLoginUserInfoMessage)
})
</script>

<style scoped>
.el-header {
	margin-bottom: 48px;
}
.el-system-name {
	padding-top: 25px;
	font-size: 32px;
	font-family: 'Source Han Sans', '思源黑体', 'Microsoft YaHei', sans-serif;
	font-weight: bold;
	color: #000000;
}
.hos-login-main {
	display: flex;
	height: 502px;
	opacity: 1;
	border-radius: 0;
}
.login-company-logo {
	height: 45px;
}
.footer-item + .footer-item:not(.newline) {
	margin-left: 5px;
}
.newline {
	display: block;
	margin: auto;
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
