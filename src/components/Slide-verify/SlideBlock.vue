<template>
	<div
		class="slider slider-block"
		:class="{
			'verify-active': verifyActive,
			'verify-success': verifySuccess,
			'verify-fail': verifyFail,
		}"
	>
		<!-- 滑动条 -->
		<hos-slider v-model="internalValue" @input="input" @change="change" :disabled="disabled" :show-tooltip="false"></hos-slider>
		<!--滑动条提示文字-->
		<div class="slider-hint">{{ sliderHint }}</div>
	</div>
</template>
<script>
// import { getCodeImg } from "@/api/login";
export default {
	name: 'sliderVerify',
	props: {
		resetSlider: {
			default: '',
		},
		value: {
			type: Number,
			default: 0,
		},
		// 阻塞块长度
		blockLength: {
			type: Number,
			default: 42,
		},
		// 阻塞块弧度
		blockRadius: {
			type: Number,
			default: 10,
		},
		// 画布宽度
		canvasWidth: {
			type: Number,
			default: 350,
		},
		// 画布高度
		canvasHeight: {
			type: Number,
			default: 155,
		},
		successIcon: {
			type: String,
			default: 'hos-icom-select-grant',
		},
		startIcon: {
			type: String,
			default: 'hos-icom-arrow-right',
		},
		barBackground: {
			type: String,
			default: 'linear-gradient(90deg,rgba(0, 255, 211, 0) 0%,#00ffd3 100%)',
		},
		
		// 滑块操作提示
		// sliderHint: {
		// 	type: String,
		// 	default: '',
		// },
		// 可允许的误差范围小；为1时，则表示滑块要与凹槽完全重叠，才能验证成功。默认值为5，若为 -1 则不进行机器判断
		accuracy: {
			type: Number,
			default: 3,
		},
		disabled: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			internalValue: this.value,
			// 前端校验
			isFrontCheck: true,
			// 校验进行状态
			verifyActive: false,
			// 校验成功状态
			verifySuccess: false,
			// 校验失败状态
			verifyFail: false,
			// 阻塞块对象
			blockObj: null,
			// 图片画布对象
			canvasCtx: null,
			// 阻塞块画布对象
			blockCtx: null,
			// 阻塞块宽度
			blockWidth: this.blockLength * 2,
			// 阻塞块的横轴坐标
			blockX: undefined,
			// 阻塞块的纵轴坐标
			blockY: undefined,
			// 图片对象
			image: undefined,
			// 移动的X轴坐标
			originX: undefined,
			// 移动的Y轴做坐标
			originY: undefined,
			// 拖动距离数组
			dragDistanceList: [],
			// 滑块箱拖动宽度
			sliderBoxWidth: 0,
			// 滑块按钮距离左侧起点位置
			sliderButtonLeft: 0,
			// 鼠标按下状态
			isMouseDown: false,
			// 图片加载提示，防止图片没加载完就开始验证
			isLoading: true,
			// 时间戳，计算滑动时长
			timestamp: null,
			// 成功提示
			successHint: '',
			// 随机字符串
			nonceStr: undefined,
			sliderHint: this.$t('请按住滑块，拖动到最右边')
		};
	},
	watch: {
		resetSlider: {
			handler(val) {
				console.log('ac in watch value', val)
				this.internalValue = 0
				this.input(0)
			},
		},
	},
	mounted() {
		this.addIcon()
		document.querySelector('.hos-slider__bar').style.background = this.barBackground
		
		// this.bindEvents();
	},
	computed: {
		currentPosition() {
			// return `${ (this.value - this.min) / (this.max - this.min) * 100 }%`;
			return '100%';
		},
	},
	methods: {
		addIcon() {
			const elementI = document.createElement('i')
			elementI.className = this.startIcon
			document.querySelector('.hos-slider__button-wrapper').append(elementI)
		},
		input(val) {
			this.$emit('input', val)
			if(val === 0) {
				this.sliderHint = this.$t('请按住滑块，拖动到最右边')
				if(document.querySelector('.hos-slider__button-wrapper')) {
					document.querySelector('.hos-slider__button-wrapper').style.color = '#000'
					document.querySelector('.hos-slider__button-wrapper').style.background = '#fff'
					document.querySelector('.hos-slider__button-wrapper i').className = this.startIcon
					document.querySelector('.slider-hint').style.color = '#9296A1'
				}
			} else if(val > 0 && val < 95) {
				this.sliderHint = ''
				// 按钮样式
				document.querySelector('.hos-slider__button-wrapper').style.background = '#5386FF'
				document.querySelector('.hos-slider__button-wrapper').style.color = '#fff'
				document.querySelector('.hos-slider__button-wrapper i').className = this.startIcon
				this.addClass(document.querySelector('.hos-slider__button-wrapper'), 'is-moving')
				// 填充样式
				document.querySelector('.hos-slider__bar').style.borderColor = '#7EA4FF'
				document.querySelector('.hos-slider__bar').style.background = '#E9EFFF'
				document.querySelector('.slider-hint').style.color = '#9296A1'
			} else if(val > 95) {
				this.verifySuccess = true;
				this.internalValue = 100
				// 按钮样式
				document.querySelector('.hos-slider__button-wrapper i').className = this.successIcon
				document.querySelector('.hos-slider__button-wrapper').style.background = '#41B349'
				document.querySelector('.hos-slider__button-wrapper').style.color = '#fff'
				// 填充样式
				document.querySelector('.hos-slider__bar').style.borderColor = '#41B349'
				document.querySelector('.hos-slider__bar').style.background = '#EBF7EC'
				document.querySelector('.slider-hint').style.color = '#19A323'
				// 
				this.addClass(document.querySelector('.hos-slider__button-wrapper'), 'is-moving')
				this.sliderHint = this.$t('验证通过！')
				this.$emit('success')
			}
		},
		change(val){
			if(val < 95) {
				this.internalValue = 0
				this.$emit('change', val)
			}
		},
		/* 初始化*/
		init() {
			this.initDom();
			this.bindEvents();
		},
		/* 初始化DOM对象*/
		initDom() {
			// this.blockObj = this.$refs.block;
			if (this.isFrontCheck) {
				// this.canvasCtx = this.$refs.canvas.getContext('2d');
				// this.blockCtx = this.blockObj.getContext('2d');
				// this.initImage();
			} else {
				this.getCaptcha();
			}
		},
		/* 后台获取验证码*/
		getCaptcha() {
			let self = this;
			//取后端默认值
			const data = {};
			// getCodeImg(data).then((response) => {
			//       const data = response.data;
			//       self.nonceStr = data.nonceStr;
			//       self.$refs.block.src = data.blockSrc;
			//       self.$refs.block.style.top = data.blockY + 'px';
			//       self.$refs.canvas.src = data.canvasSrc;
			//   }).finally(() => {
			//       self.isLoading = false;
			//   });
		},
		/* 校验图片是否存在*/
		checkImgSrc() {
			if (this.isFrontCheck) {
				return true;
			}
			return !!this.$refs.canvas.src;
		},
		/* 滑动开始事件*/
		startEvent(event) {
			console.log(event.clientX, 'startEvent');
			event.preventDefault();
			if (this.isLoading || this.verifySuccess) {
				return;
			}
			if (event.type === 'touchstart') {
				event.clientY = event.touches[0].clientY;
				event.clientX = event.touches[0].clientX;
			}
			this.originX = event.clientX;
			this.timestamp = +new Date();

			this.onDragStart(event);
			window.addEventListener('mousemove', this.moveEvent);
			window.addEventListener('touchmove', this.moveEvent);
			// window.addEventListener('mouseup', this.onDragEnd);
			// window.addEventListener('touchend', this.onDragEnd);
			// window.addEventListener('contextmenu', this.onDragEnd);
		},
		/* 滑动事件*/
		moveEvent(event) {
			console.log(event.clientX, 'moveEvent', this.isMouseDown);
			event.preventDefault();

			if (!this.isMouseDown) {
				return false;
			}
			const moveX = event.clientX - this.originX;
			// const moveY = clientY - this.originY;
			// if (moveX < 0 || moveX + 40 >= this.canvasWidth) {
			// 	return false;
			// }
			this.sliderButtonLeft = moveX + 'px';
			// let blockLeft =
			// 	((this.canvasWidth - 40 - 20) / (this.canvasWidth - 40)) * moveX;
			// this.blockObj.style.left = blockLeft + 'px';
			this.verifyActive = true;
			this.sliderBoxWidth = moveX + 'px';
			// this.dragDistanceList.push(moveY);
		},
		/* 滑动结束事件*/
		endEvent(event) {
			event.preventDefault();
			if (!this.isMouseDown) {
				return false;
			}
			this.isMouseDown = false;
			if (event.clientX === this.originX) {
				return false;
			}
			// 开始校验
			this.isLoading = true;
			// 校验结束
			this.verifyActive = false;
			// 滑动时长
			this.timestamp = +new Date() - this.timestamp;
			// 移动距离
			const moveLength = parseInt(this.blockObj.style.left);
			// 限制操作时长10S，超出判断失败
			if (this.timestamp > 10000) {
				this.verifyFailEvent();
			}
			// 人为操作判定
			else if (!this.turingTest()) {
				this.verifyFail = true;
				this.$emit('again');
			}
			// 是否前端校验
			else if (this.isFrontCheck) {
				const accuracy =
					this.accuracy <= 1 ? 1 : this.accuracy > 10 ? 10 : this.accuracy; // 容错精度值
				const spliced = Math.abs(moveLength - this.blockX) <= accuracy; // 判断是否重合
				if (!spliced) {
					this.verifyFailEvent();
				} else {
					// 设置特殊值，后台特殊处理，直接验证通过
					this.$emit('success', { nonceStr: this.nonceStr, value: moveLength });
				}
			} else {
				this.$emit('success', { nonceStr: this.nonceStr, value: moveLength });
			}
		},
		/* 图灵测试*/
		turingTest() {
			const arr = this.dragDistanceList; // 拖动距离数组
			const average = arr.reduce(sum) / arr.length; // 平均值
			const deviations = arr.map((x) => x - average); // 偏离值
			const stdDev = Math.sqrt(deviations.map(square).reduce(sum) / arr.length); // 标准偏差
			return average !== stdDev; // 判断是否人为操作
		},
		/* 校验成功*/
		verifySuccessEvent() {
			this.isLoading = false;
			this.verifySuccess = true;
			const elapsedTime = (this.timestamp / 1000).toFixed(1);
			if (elapsedTime < 1) {
				this.successHint = `仅仅${elapsedTime}S，你的速度快如闪电`;
			} else if (elapsedTime < 2) {
				this.successHint = `只用了${elapsedTime}S，这速度简直完美`;
			} else {
				this.successHint = `耗时${elapsedTime}S，争取下次再快一点`;
			}
		},
		/* 校验失败*/
		verifyFailEvent(msg) {
			this.verifyFail = true;
			this.$emit('fail', msg);
			this.refresh();
		},
		/* 刷新图片验证码*/
		refresh() {
			// 延迟class的删除，等待动画结束
			setTimeout(() => {
				this.verifyFail = false;
			}, 500);
			this.isLoading = true;
			this.verifyActive = false;
			this.verifySuccess = false;
			this.blockObj.style.left = 0;
			this.sliderBoxWidth = 0;
			this.sliderButtonLeft = 0;
			if (this.isFrontCheck) {
				// 刷新画布
				let { canvasWidth, canvasHeight } = this;
				this.canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
				this.blockCtx.clearRect(0, 0, canvasWidth, canvasHeight);
				this.blockObj.width = canvasWidth;
				// 刷新图片
				this.image.src = this.getImageSrc();
			} else {
				this.getCaptcha();
			}
		},
		onDragStart(event) {
			this.isMouseDown = true;
			// this.dragging = true;
			// this.isClick = true;
			if (event.type === 'touchstart') {
				event.clientY = event.touches[0].clientY;
				event.clientX = event.touches[0].clientX;
			}
			this.originX = event.clientX;
			this.startPosition = parseFloat(this.currentPosition);
			this.newPosition = this.startPosition;
		},
		addClass(element, className) {
			if (element.classList) {
				element.classList.add(className);
			} else {
				element.className += ' ' + className;
			}
		}

	},
};
</script>
<style lang="scss">
.slider-block {
	position: relative;
	width: 100%;
	height: 45px;
	border: 1px solid #3b8cd9;
	background: rgba(65, 165, 255, 0.5);
	border-radius: 4px;
	&.verify-success {
		.slider-hint {
			visibility: visible;
		}
	}
	.hos-slider {
    width: calc(100% - 41px);
	}
	.slider-hint {
		position: absolute;
		top: 0;
		text-align: center;
		color: #fff;
		width: 100%;
		height: 100%;
		// line-height: 100%;
		background: transparent;
	}
	.hos-slider__runway {
		background: transparent;
		&.disabled {
			.hos-slider__bar {
				background: linear-gradient(90deg,rgba(0, 255, 211, 0) 0%,#00ffd3 100%);
			}
			.hos-slider__button-wrapper:hover {
				cursor: auto;
			}
		}
		.hos-slider__bar {
			height: 43px;
			top: -15px;
			background: linear-gradient(90deg,rgba(0, 255, 211, 0) 0%,#00ffd3 100%);
		}
	}
	.hos-slider__button-wrapper {
		top: -16px;
		width: 45px;
		height: 45px;
		background: #41a5ff;
		border-radius: 5px;
		box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.3);
		transform: translate(0);
		.hos-icom-arrow-right {
			color: #fff;
			font-size: 16px;
			line-height: 45px;
		}
		.hos-slider__button {
			display: none;
		}
		.is-moving {
			background: #5386FF;
			color: #fff;
		}
	}
}
</style>
