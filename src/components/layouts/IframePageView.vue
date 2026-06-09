<template>
  <iframe
    :id="currentId"
    :src="currentUrl"
    frameborder="0"
    width="100%"
    height="900px"
    scrolling="auto"
  ></iframe>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { lsGet } from '@/utils/ls'
import { ACCESS_TOKEN } from '@/store/mutation-types'

defineOptions({ name: 'IframePageContent' })

const props = defineProps<{
	url?: string
	id?: string
}>()

const route = useRoute()
const currentUrl = ref('')
const currentId = ref('')

function goUrl() {
	let url: string | undefined
	let id = ''
	if (props.url && props.id) {
		url = props.url
		id = props.id
	} else {
		url = route.meta.url as string | undefined
		id = route.path
	}
	currentId.value = id
	if (url !== null && url !== undefined) {
		const tokenStr = '${token}'
		if (url.indexOf(tokenStr) !== -1) {
			const token = lsGet(ACCESS_TOKEN)
			currentUrl.value = url.replace(tokenStr, String(token ?? ''))
		} else {
			currentUrl.value = url
		}
	}
}

onMounted(() => {
	goUrl()
})

watch(
	() => [props.url, props.id, route.path, route.meta.url],
	() => {
		goUrl()
	},
)
</script>
