<template>
	<div class="slide-wrap">
		<div @click="close" class="slide-verify-close">
			<el-icon><Close /></el-icon>
		</div>
		<SlideBlock
			v-if="type === 'block'"
			v-bind="$attrs"
			@change="(val: number) => emit('change', val)"
			@success="(val: unknown) => emit('success', val)"
			@input="(val: number) => emit('input', val)"
		/>
		<SlideImage
			v-if="type === 'image'"
			v-bind="$attrs"
			@change="(val: number) => emit('change', val)"
			@success="(val: unknown) => emit('success', val)"
			@input="(val: number) => emit('input', val)"
			:canvasWidth="268"
		/>
	</div>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'
import SlideImage from './SlideImage.vue'
import SlideBlock from './SlideBlock.vue'

defineOptions({ name: 'SlideVerify', inheritAttrs: false })

withDefaults(
	defineProps<{
		type?: string
	}>(),
	{
		type: 'block',
	},
)

const emit = defineEmits<{
	close: []
	change: [val: unknown]
	success: [val: unknown]
	input: [val: unknown]
}>()

function close() {
	emit('close')
}
</script>

<style lang="scss" scoped>
.slide-wrap {
	position: absolute;
	left: 50%;
	top: 50%;
	z-index: 10001;
	transform: translate(-50%, -50%);
	width: 292px;
	box-sizing: border-box;
	display: flex;
	background-color: #fff;
	flex-direction: column;
	border-radius: 2px;
	box-shadow: 0px 0 3px 1px rgba(0, 0, 0, 0.2);
	.slide-verify-close {
		position: absolute;
		right: 5px;
		top: 0;
		width: 12px;
		height: 12px;
		cursor: pointer;
		.hos-icom-close {
			font-size: 12px;
		}
	}
}
</style>
