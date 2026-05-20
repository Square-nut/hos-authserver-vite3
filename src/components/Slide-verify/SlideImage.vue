<template>
	<div class="image-slider-popper" placement="top" ref="dcPopover">
		<div class="image-slider-top" @click="refresh">
			完成拼图验证
			<a href="javascript:;"><i class="hos-icom-big-refresh"></i>换一张</a>
		</div>
		<div
			class="slide-verify"
			:style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
			onselectstart="return false;"
		>
			<!-- 图片加载遮蔽罩 -->
			<div
				:class="{ 'img-loading': isLoading }"
				:style="{ height: canvasHeight + 'px' }"
				v-if="isLoading"
			/>
			<!-- 认证成功后的文字提示 -->
			<div
				class="success-hint"
				:style="{ height: canvasHeight + 'px' }"
				v-if="verifySuccess"
			>
				{{ successHint }}
			</div>
			<!--刷新按钮-->
			<!-- <div class="refresh-icon" @click="refresh" /> -->
			<!--前端生成-->
			<template v-if="isFrontCheck">
				<!--验证图片-->
				<canvas
					ref="canvas"
					class="slide-canvas"
					:width="canvasWidth"
					:height="canvasHeight"
				/>
				<!--阻塞块-->
				<canvas
					v-if="!isLoading"
					ref="block"
					class="slide-block"
					:width="canvasWidth"
					:height="canvasHeight"
				/>
			</template>
			<!--后端生成-->
			<template v-else>
				<!--验证图片-->
				<img
					ref="canvas"
					class="slide-canvas"
					:width="canvasWidth"
					:height="canvasHeight"
				/>
				<!--阻塞块-->
				<img
					v-show="!isLoading"
					ref="block"
					:class="['slide-block', { 'verify-fail': verifyFail }]"
				/>
			</template>
		</div>
		<div class="image-slider-bottom">
			<!-- 滑动条 -->
			<div
				class="slider"
				:class="{
					'verify-active': verifyActive,
					'verify-success': verifySuccess,
					'verify-fail': verifyFail,
				}"
			>
				<!--滑块-->
				<div class="slider-box" :style="{ width: sliderBoxWidth + 'px' }">
					<!-- 按钮 -->
					<div
						class="slider-button"
						id="slider-button"
						:style="{ left: sliderButtonLeft }"
					>
						<!-- 按钮图标 -->
						<div class="slider-button-icon hos-icom-triangle-green-right" />
					</div>
				</div>
				<!--滑动条提示文字-->
				<span class="slider-hint">{{ sliderHint }}</span>
			</div>
		</div>

		<!-- <div class="slide-verify-root" slot="reference" @click="yorn = !yorn" 
				:class="{ 'verify-success': verifySuccess }">
        <i class="hos-icom-select-grant" v-if="verifySuccess"></i>
			{{ slideVerifyRootText }}
		</div> -->
		<!-- <span
              slot="reference"
              @click="yorn = !yorn"
              class="hos-edition simple-edition"
              :class="{
                'button-yellow': licenseType == 2,
                'button-red': licenseType != 1 && licenseType != 2
              }"
            >
              {{ licenseEdition }}
            </span> -->
	</div>
</template>

<script>
function sum(x, y) {
	return x + y;
}

function square(x) {
	return x * x;
}

// import { getCodeImg } from "@/api/login";
export default {
	name: 'sliderVerify',
	props: {
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
			default: 380,
		},
		// 画布高度
		canvasHeight: {
			type: Number,
			default: 95,
		},
		// 滑块操作提示
		sliderHint: {
			type: String,
			default: '向右滑动完成拼图',
		},
		// 可允许的误差范围小；为1时，则表示滑块要与凹槽完全重叠，才能验证成功。默认值为5，若为 -1 则不进行机器判断
		accuracy: {
			type: Number,
			default: 3,
		},
		// 图片资源数组
		imageList: {
			type: Array,
			default: () => [],
		},
		pcode: {
			type: String,
			default: '',
		},
	},
	data() {
		return {
			sessionId: '',
			yorn: true, // 是否显示许可证提示
			// 前端校验
			isFrontCheck: false,
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
			sliderBoxWidth: 19,
			// 滑块按钮距离左侧起点位置
			sliderButtonLeft: 10,
			// 鼠标按下状态
			isMouseDown: false,
			// 图片加载提示，防止图片没加载完就开始验证
			isLoading: true,
			// 时间戳，计算滑动时长
			timestamp: null,
			// 成功提示
			successHint: this.$t('验证通过!'),
			// 随机字符串
			nonceStr: undefined,
			// 占位符提示
			slideVerifyRootText: this.$t('点击此处进行验证'),
		};
	},
	mounted() {
		this.init();
	},
	methods: {
		/* 初始化*/
		init() {
			this.initDom();
			this.bindEvents();
		},
		/* 初始化DOM对象*/
		initDom() {
			this.blockObj = this.$refs.block;
			if (this.isFrontCheck) {
				this.canvasCtx = this.$refs.canvas.getContext('2d');
				this.blockCtx = this.blockObj.getContext('2d');
				this.initImage();
			} else {
				this.isLoading = true;
				this.getCaptcha();
			}
		},
		/* 后台获取验证码*/
		getCaptcha() {
			let self = this;
			//取后端默认值
			const data = {};
			this.isLoading = true;
			this.$api('slider.generateCaptcha', data)
				.then((response) => {
					this.isLoading = false
					const data = response.data;
					if (response.code == 200) {
						this.sessionId = data.sessionId;
						self.$refs.block.src = data.sliderImg;
						self.$refs.block.style.top = data.yposition + 'px';
						self.$refs.canvas.src = data.backgroundImg;
					}
				})
				.catch((e) => {
					self.isLoading = false;
				});
		},
		/* 前端获取验证码*/
		initImage() {
			const image = this.createImage(() => {
				this.drawBlock();
				let {
					canvasWidth,
					canvasHeight,
					blockX,
					blockY,
					blockRadius,
					blockWidth,
				} = this;
				this.canvasCtx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
				this.blockCtx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
				// 将抠图防止最左边位置
				let yAxle = blockY - blockRadius * 2;
				let ImageData = this.blockCtx.getImageData(
					blockX,
					yAxle,
					blockWidth,
					blockWidth
				);
				this.blockObj.width = blockWidth;
				this.blockCtx.putImageData(ImageData, 0, yAxle);
				// 图片加载完关闭遮蔽罩
				this.isLoading = false;
				// 前端校验设置特殊值
				this.nonceStr = 'loyer';
			});
			this.image = image;
		},
		/* 创建image对象*/
		createImage(onload) {
			const image = document.createElement('img');
			image.crossOrigin = 'Anonymous';
			image.onload = onload;
			image.onerror = () => {
				image.src = require('../../assets/images/big_bg.jpg');
			};
			image.src = this.getImageSrc();
			return image;
		},
		/* 获取imgSrc*/
		getImageSrc() {
			const len = this.imageList.length;
			return len > 0
				? this.imageList[this.getNonceByRange(0, len)]
				: `https://loyer.wang/view/ftp/wallpaper/${this.getNonceByRange(
						1,
						1000
				  )}.jpg`;
		},
		/* 根据指定范围获取随机数*/
		getNonceByRange(start, end) {
			return Math.round(Math.random() * (end - start) + start);
		},
		/* 绘制阻塞块*/
		drawBlock() {
			this.blockX = this.getNonceByRange(
				this.blockWidth + 10,
				this.canvasWidth - (this.blockWidth + 10)
			);
			this.blockY = this.getNonceByRange(
				10 + this.blockRadius * 2,
				this.canvasHeight - (this.blockWidth + 10)
			);
			this.draw(this.canvasCtx, 'fill');
			this.draw(this.blockCtx, 'clip');
		},
		/* 绘制事件*/
		draw(ctx, operation) {
			const PI = Math.PI;
			let { blockX: x, blockY: y, blockLength: l, blockRadius: r } = this;
			// 绘制
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI);
			ctx.lineTo(x + l, y);
			ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI);
			ctx.lineTo(x + l, y + l);
			ctx.lineTo(x, y + l);
			ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true);
			ctx.lineTo(x, y);
			// 修饰
			ctx.lineWidth = 2;
			ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
			ctx.stroke();
			ctx[operation]();
			ctx.globalCompositeOperation = 'destination-over';
		},
		/* 事件绑定*/
		bindEvents() {
			// 监听鼠标按下事件
			document
				.getElementById('slider-button')
				.addEventListener('mousedown', (event) => {
					this.startEvent(event.clientX, event.clientY);
				});
			// 监听鼠标移动事件
			document.addEventListener('mousemove', (event) => {
				this.moveEvent(event.clientX, event.clientY);
			});
			// 监听鼠标离开事件
			document.addEventListener('mouseup', (event) => {
				this.endEvent(event.clientX);
			});
			// 监听触摸开始事件
			document
				.getElementById('slider-button')
				.addEventListener('touchstart', (event) => {
					this.startEvent(
						event.changedTouches[0].pageX,
						event.changedTouches[0].pageY
					);
				});
			// 监听触摸滑动事件
			document.addEventListener('touchmove', (event) => {
				this.moveEvent(
					event.changedTouches[0].pageX,
					event.changedTouches[0].pageY
				);
			});
			// 监听触摸离开事件
			document.addEventListener('touchend', (event) => {
				this.endEvent(event.changedTouches[0].pageX);
			});
		},
		/* 校验图片是否存在*/
		checkImgSrc() {
			if (this.isFrontCheck) {
				return true;
			}
			return !!this.$refs.canvas.src;
		},
		/* 滑动开始事件*/
		startEvent(originX, originY) {
			if (!this.checkImgSrc() || this.isLoading || this.verifySuccess) {
				return;
			}
			this.originX = originX;
			this.originY = originY;
			this.isMouseDown = true;
			this.timestamp = +new Date();
		},
		/* 滑动事件*/
		moveEvent(originX, originY) {
			if (!this.isMouseDown) {
				return false;
			}
			const moveX = originX - this.originX;
			// console.log('ac in move', moveX, this.sliderBoxWidth, this.canvasWidth);
			const moveY = originY - this.originY;
			if (moveX < 0 || moveX + 32 >= this.canvasWidth) {
				return false;
			}
			this.sliderButtonLeft = moveX + 'px';
			let blockLeft =
				((this.canvasWidth - 40 - 20) / (this.canvasWidth - 40)) * moveX;
			this.blockObj.style.left = blockLeft + 'px';
			this.verifyActive = true;
			this.sliderBoxWidth = moveX + 32;
			this.dragDistanceList.push(moveY);
		},
		/* 滑动结束事件*/
		endEvent(originX) {
			if (!this.isMouseDown) {
				return false;
			}
			this.isMouseDown = false;
			if (originX === this.originX) {
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
					this.verifySuccessEvent();
					this.$emit('success', { nonceStr: this.nonceStr, value: moveLength });
					this.slideVerifyRootText = this.$t('验证通过！');
				}
			} else {
				this.verifyCaptcha({ sessionId: this.sessionId, moveX: moveLength });
				// this.$emit('success', { sessionId: this.sessionId, moveX: moveLength });
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
			this.sliderBoxWidth = 19;
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
		verifyCaptcha(val) {
			this.$api('slider.verifyCaptcha', {
				...val,
				mobile: this.pcode,
			})
				.then((response) => {
					if (response.code == 200 && response.data.success === true) 
					{
						this.slideVerifyRootText = this.$t('验证通过！')
						this.verifySuccessEvent()
						this.msgToken = response.data.token
						setTimeout(() => {
							this.$emit('success', this.msgToken)
						}, 2000);
						// this.verifySuccessEvent();
					} else {
						this.verifyFailEvent(response.msg);
					}
				})
				.catch((error) => {
					this.verifyFailEvent(error.message);
				});
		},
	},
};
</script>

<style lang="scss" scoped>
div {
	box-sizing: border-box;
	padding: 0;
	margin: 0;
}
.image-slider-popper {
	width: 292px;
	box-sizing: border-box;
	padding: 0 12px;
	display: flex;
	background-color: #fff;
	flex-direction: column;
	border-radius: 2px;
	box-shadow: 0px 0 3px 1px rgba(0, 0, 0, 0.2);

	.image-slider-top {
		height: 45px;
		line-height: 45px;
		font-size: 14px;
		color: #666;
		border-bottom: 1px solid #e4e4e4;
		i {
			font-size: 14px;
		}
		a {
			float: right;
			padding-right: 5px;
			font-size: 14px;
			text-decoration: none;
		}
	}
}
.slide-verify {
	position: relative;
	// height: 110px;

	/*图片加载样式*/
	.img-loading {
		// display: none;
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		z-index: 999;
		width: 100%;
		height: 100%;
		animation: loading 1.5s infinite;
		background-image: url(../../assets/images/loading.png);
		background-color: #fff;
		background-repeat: no-repeat;
		background-position: center center;
		background-size: 100px;
		// background-color: #737c8e;
		border-radius: 5px;
	}

	/*认证成功后的文字提示*/
	.success-hint {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.8);
		color: #2cd000;
		font-size: large;
	}

	/*刷新按钮*/
	.refresh-icon {
		position: absolute;
		right: 0;
		top: 0;
		width: 35px;
		height: 35px;
		cursor: pointer;
		/* background: url("../../assets/images/light.png") 0 -432px; */
		background-size: 35px 470px;
	}

	/*验证图片*/
	.slide-canvas {
		width: 100%;
		// height: 100%;
		border-radius: 5px;
	}

	/*阻塞块*/
	.slide-block {
		position: absolute;
		left: 0;
		top: 0;
		width: 40px;
		height: 46px;
		z-index: 998;
	}
}

@keyframes loading {
	0% {
		opacity: 0.7;
	}
	100% {
		opacity: 9;
	}
}

/*校验失败时的阻塞块样式*/
.slide-block.verify-fail {
	transition: left 0.5s linear;
}
.image-slider-bottom {
	height: 60px;
	width: 100%;
	padding: 10px 0;
	/*滑动条*/
	.slider {
		position: relative;
		text-align: center;
		width: 100%;
		height: 34px;
		line-height: 34px;
		// margin-top: 4px;
		// margin-bottom: 2px;
		background: #e4e4e4;
		color: #45494c;
		border-radius: 20px;
		background-color: #f6faff;
		border-radius: 15px;
		box-shadow: inset 0 0 8px 2px #ddedf6;

		/*滑动盒子*/
		.slider-box {
			position: absolute;
			left: 0;
			top: 0;
			height: 34px;
			border: 0 solid #1991fa;
			background: #fff;
			border-radius: 17px;

			/*滑动按钮*/
			.slider-button {
				position: absolute;
				top: -3px;
				left: 0;
				width: 38px;
				height: 38px;
				background: #fff;
				box-shadow: 0px 0px 3px 1px #ddedf6;
				cursor: pointer;
				transition: background 0.2s linear;
				border-radius: 50%;
			}

			/*鼠标悬浮时的按钮样式*/
			.slider-button:hover {
				// background: #1991fa;
			}

			/*鼠标悬浮时的按钮图标样式*/
			.slider-button:hover .slider-button-icon {
				background-position: 0 -13px;
			}

			/*滑动按钮图标*/
			.slider-button-icon {
				line-height: 38px;
				color: #21a5f6;
				// position: absolute;
				// top: 15px;
				// left: 13px;
				// width: 15px;
				// height: 13px;
				/* background: url("../../assets/images/light.png") 0 -26px; */
				// background-size: 35px 470px;
			}
		}
		.slider-hint {
			color: #21a5f6;
			user-select: none;
		}
		/*校验状态下的提示文字隐藏*/
		&.verify-active {
			/*校验时的滑动箱样式*/
			.slider-box {
				// height: 30px;
				// border-width: 1px;
				background: linear-gradient(to bottom, #85b2f5, #73cff9);
				/*校验时的按钮样式*/
				.slider-button {
					// height: 34px;
					// border: 1px solid #1991fa;
				}
			}
		}
		&.verify-success {
			/*校验成功时的滑动箱样式*/
			.slider-box {
				// height: 30px;
				// border: 1px solid #52ccba;
				background-color: #d2f4ef;
				/*校验成功时的按钮样式*/
				.slider-button {
					// height: 42px;
					// border: 1px solid #52ccba;
					// background-color: #52ccba !important;

					/*校验成功时的按钮图标样式*/
					.slider-button-icon {
						user-select: none;
						background-position: 0 0 !important;
					}
				}
			}
		}
		&.verify-fail {
			/*校验失败时的滑动箱样式*/
			.slider-box {
				// height: 30px;
				// border: 1px solid #f57a7a;
				background-color: #ef3735;
				transition: width 0.5s linear;
				/*校验失败时的按钮样式*/
				.slider-button {
					transition: left 0.5s linear;
					/*校验失败时的按钮图标样式*/
					.slider-button-icon {
						top: 14px;
						background-position: 0 -82px !important;
					}
				}
			}
		}
		&.verify-active .slider-hint,
		&.verify-success .slider-hint,
		&.verify-fail .slider-hint {
			// display: none;
		}
	}
}

.slide-verify-root {
	display: none;
	position: relative;
	width: 100%;
	height: 40px;
	line-height: 40px;
	text-align: center;
	color: rgba(153, 153, 153, 1);
	background: #e4e4e4;
	border-radius: 20px;
	cursor: pointer;
	&.verify-success {
		color: rgba(19, 174, 55, 1);
		background: rgba(239, 255, 235, 1);
	}
	.hos-icom-select-grant {
		position: absolute;
		right: 15px;
		font-size: 16px;
		line-height: 45px;
		color: rgba(19, 174, 55, 1);
	}
}
</style>
<style lang="scss"></style>
