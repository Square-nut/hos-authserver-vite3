<template>
	<div>
		<img
			src="../../assets/images/loading.png"
			alt=""
			class="loadding-img"
		/>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

defineOptions({ name: 'freeAuth' })

const route = useRoute()
const userStore = useUserStore()

async function init() {
	const { query } = route
	if (query.CASTicket) {
		const freeLoginParam = {
			grantType: 'HISCAS',
			CASTicket: query.CASTicket as string,
		}
		try {
			const { code, msg } = await userStore.Login(freeLoginParam)
			if (code == 200) {
				freeAuthSuccessCallback('CASTicket')
			} else {
				ElMessage.error(msg)
			}
		} catch (error: unknown) {
			const err = error as { msg?: string }
			ElMessage.error(err.msg ?? '')
		}
	}
}

function freeAuthSuccessCallback(_delParams: string) {
	const redirect = route.query.redirect as string
	window.location.href = redirect
}

onMounted(() => {
	if (document.querySelector('.login-loading-mask')) {
		(document.querySelector('.login-loading-mask') as HTMLElement).style.display =
			'none'
	}
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
	text-align: center;
}
.loadding-img {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
</style>
<style lang="scss">
.authorize {
	.install-license {
		color: #5db42f;
		cursor: pointer;
	}
	.continue {
		color: #5db42f;
		cursor: pointer;
	}
}
.loadding-img {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
</style>
