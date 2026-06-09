<template>
	<div></div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { getToken } from '@/utils/base/token-util'

defineOptions({ name: 'post-message' })

onMounted(() => {
	const token = getToken()
	window.parent.postMessage(token, '*')
})
</script>
