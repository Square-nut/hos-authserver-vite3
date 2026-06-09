<template>
	<div>
		<div class="authorize" v-if="result">
			<img src="../../assets/images/noData.png" alt="" />
			<div class="text-align-center">{{ result }}</div>
		</div>
		<div v-else>
			<img src="../../assets/images/loading.png" alt="" class="loadding-img" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchOauthAuthorize } from '@/api/oauth'
import { getLocale } from '@/utils/i18n/i18n-util'
import { lsGet } from '@/utils/ls'

defineOptions({ name: 'oauth_authorize' })

const route = useRoute()
const result = ref('')

function decodeSpecialURI(str: string | null) {
	if (!str) return ''

	let decoded = str.replace(/%u([0-9A-Fa-f]{4})/gi, (_match, hex: string) => {
		return String.fromCharCode(parseInt(hex, 16))
	})

	try {
		return decodeURIComponent(decoded)
	} catch (e) {
		console.warn('decodeURIComponent 仍然失败，使用备用方案', e)
		return decoded
	}
}

function init() {
	if (document.querySelector('.login-loading-mask'))
		(document.querySelector('.login-loading-mask') as HTMLElement).style.display =
			'none'
	const urlQuery = route.query
	const urlParams = new URLSearchParams(urlQuery as Record<string, string>)
	const paramValue = urlParams.get('redirect_uri')
	let redirect_uri = decodeSpecialURI(paramValue)
	redirect_uri = encodeURIComponent(redirect_uri)
	urlParams.set('redirect_uri', redirect_uri)
	const upData: Record<string, string> = {}
	urlParams.forEach(function (value, key) {
		upData[key] = value
	})
	const IP = lsGet('IP')
	const MAC = lsGet('MAC')
	if (!upData.scope) upData.scope = 'openid'
	fetchOauthAuthorize(upData)
		.then((response) => {
			if (response && response.code == 200) {
				const data = response.data as { redirectUri: string }
				let redirectUri = data.redirectUri + '&language=' + getLocale()
				if (IP && MAC) {
					redirectUri =
						redirectUri +
						'&ip=' +
						lsGet('IP') +
						'&mac=' +
						lsGet('MAC')
				}
				location.href = redirectUri
			} else {
				if (response) {
					result.value = response.msg
				}
			}
		})
		.catch((e: { msg?: string }) => {
			result.value = e.msg ?? ''
		})
}

onMounted(() => {
	init()
})
</script>
<style lang="scss" scoped>
.authorize {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
.text-align-center {
	font-size: 16px;
	text-align: center;
}
.loadding-img {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
</style>
