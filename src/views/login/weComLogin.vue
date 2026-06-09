<template>
	<div class="">
		<div id="ww_login" ref="ww_login"></div>
	</div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'

declare const WwLogin: new (options: Record<string, string>) => unknown

defineProps<{
	loginSucessHandler?: () => void
}>()

const emit = defineEmits<{
	loginSucessHandler: []
}>()

const wwLogin = ref<unknown>(null)

onMounted(() => {
	wwLogin.value = new WwLogin({
		id: 'ww_login',
		appid: 'wwfcc31d1f36207b4f',
		agentid: '1000002',
		redirect_uri: 'http://114.251.235.9:8343/',
		state: 'loginState',
		href: 'https://xt.mediway.com.cn/ylxt/css/wx.css',
	})
	console.log(wwLogin.value)
})

function loginSucessHandler() {
	emit('loginSucessHandler')
}

defineExpose({ loginSucessHandler })
</script>
<style lang="scss" scoped></style>
<style lang="scss"></style>
