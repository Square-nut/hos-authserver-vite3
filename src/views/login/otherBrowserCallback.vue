<template>
	<div>
		<img src="../../assets/images/loading.png" alt="" class="loadding-img" />
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Qs from 'qs'
import { setCurrentLocale } from '@/utils/i18n/i18n-util'
import { useUserStore } from '@/stores/user'

defineOptions({ name: 'oauth_callback' })

const { t } = useI18n()
const userStore = useUserStore()

function init() {
	const mask = document.querySelector('.login-loading-mask') as HTMLElement | null
	if (mask) mask.style.display = 'none'

	const { key, redirectUrl, language: defaultLanguage } = Qs.parse(
		window.location.search,
		{ ignoreQueryPrefix: true },
	) as Record<string, string>

	if (defaultLanguage) setCurrentLocale(String(defaultLanguage))

	const upData = {
		grantType: 'disposableKey',
		disposableKey: key as string,
	}
	userStore.Login(upData).then(() => {
		window.location.href = redirectUrl as string
	})
}

onMounted(() => {
	document.title = t('打开其他应用')
	init()
})
</script>
<style lang="scss" scoped>
.loadding-img {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
</style>
