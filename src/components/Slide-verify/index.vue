<template>
	<div class="slide-wrap">
		<div @click="close" class="slide-verify-close">
			<el-icon><Close /></el-icon>
		</div>
		<!-- 滑动条 -->
		<SlideBlock
			v-if="type === 'block'"
			v-bind="$attrs"
			@change="change"
			@success="onSuccess"
			@input="input"
		></SlideBlock>
		<!-- 图片 -->
		<SlideImage
			v-if="type === 'image'"
			v-bind="$attrs"
			@change="change"
			@success="onSuccess"
			@input="input"
			:canvasWidth="268"
		></SlideImage>
	</div>
</template>
<script>
import { Close } from '@element-plus/icons-vue';
import SlideImage from './SlideImage';
import SlideBlock from './SlideBlock';
export default {
	name: 'SlideVerify',
	components: { Close },
	props: {
		type: {
			// block or image
			default: 'block',
			type: String,
		},
	},
	components: { SlideImage, SlideBlock },
	data() {
		return {};
	},
	created() {},
	methods: {
		close() {
			this.$emit('close');
		},
		change(val) {
			this.$emit('change', val);
		},
		onSuccess(val) {
			this.$emit('success', val);
		},
		input(val) {
			this.$emit('input', val);
		},
	},
};
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
<style lang="scss"></style>
