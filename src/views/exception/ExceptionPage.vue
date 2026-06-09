<template>
	<div class="exception">
		<div class="img">
			<img :src="pageConfig.img" />
		</div>
		<div class="content">
			<h1>{{ pageConfig.title }}</h1>
			<div class="desc">{{ pageConfig.desc }}</div>
			<div class="action">
				<el-button type="primary" @click="handleToHome">返回首页</el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import types, { type ExceptionType } from './type'

defineOptions({ name: 'Exception' })

const props = withDefaults(
	defineProps<{
		type?: ExceptionType
	}>(),
	{
		type: '404',
	},
)

const router = useRouter()
const pageConfig = computed(() => types[props.type] ?? types['404'])

function handleToHome() {
	router.push({ name: 'dashboard' })
}
</script>

<style lang="scss" scoped>
.exception {
	min-height: 500px;
	height: 80%;
	align-items: center;
	text-align: center;
	margin-top: 150px;
	.img {
		display: inline-block;
		padding-right: 52px;
		zoom: 1;
		img {
			height: 360px;
			max-width: 430px;
		}
	}
	.content {
		display: inline-block;
		flex: auto;
		h1 {
			color: #434e59;
			font-size: 72px;
			font-weight: 600;
			line-height: 72px;
			margin-bottom: 24px;
		}
		.desc {
			color: rgba(0, 0, 0, 0.45);
			font-size: 20px;
			line-height: 28px;
			margin-bottom: 16px;
		}
	}
}

.mobile {
	.exception {
		margin-top: 30px;
		.img {
			padding-right: unset;

			img {
				height: 40%;
				max-width: 80%;
			}
		}
	}
}
</style>
