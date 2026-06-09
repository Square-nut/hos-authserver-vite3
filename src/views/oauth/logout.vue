<template>
  <div>
    {{ result }}
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const result = ref('')

function logoutSystem() {
	const servceUrl = route.query.service as string
	userStore
		.Logout()
		.then(() => {
			location.href = servceUrl
		})
		.catch(() => {
			location.href = servceUrl
		})
}

onMounted(() => {
	logoutSystem()
})
</script>

<style>
.welcome > div {
  margin-top: 160px;
}
</style>
