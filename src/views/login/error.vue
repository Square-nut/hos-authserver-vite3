<template>
	<div>
		<div class="authorize">
			<img src="../../assets/images/noData.png" alt="" />
			<div class="text-align-center">{{ result }}</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { fetchOauthAuthorize } from '@/api/oauth'

defineOptions({ name: 'oauth_error' })

const route = useRoute()
const result = ref('')

function init() {
	const { code, msg } = route.query
	result.value = String(msg ?? '')
	const upData: Record<string, unknown> = { code }
	if (!upData.scope) upData.scope = 'openid%20profile'
	fetchOauthAuthorize(upData)
		.then((response) => {
			if (response && response.code == 200) {
				result.value = String(response.data ?? '')
			} else {
				ElMessage.error(response?.msg ?? '')
			}
		})
		.catch((response: { msg?: string }) => {
			ElMessage.error(response?.msg ?? '')
		})
}

onMounted(init)
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
</style>
