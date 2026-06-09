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
					ref="canvasRef"
					class="slide-canvas"
					:width="canvasWidth"
					:height="canvasHeight"
				/>
				<!--阻塞块-->
				<canvas
					v-if="!isLoading"
					ref="blockRef"
					class="slide-block"
					:width="canvasWidth"
					:height="canvasHeight"
				/>
			</template>
			<!--后端生成-->
			<template v-else>
				<!--验证图片-->
				<img
					ref="canvasRef"
					class="slide-canvas"
					:width="canvasWidth"
					:height="canvasHeight"
				/>
				<!--阻塞块-->
				<img
					v-show="!isLoading"
					ref="blockRef"
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

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/composables/useApi'
import fallbackSlideBg from '@/assets/images/big_bg.jpg'
import { isSuccessCode } from '@/types/api-common'

defineOptions({ name: 'sliderVerify' })

const props = withDefaults(
	defineProps<{
		blockLength?: number
		blockRadius?: number
		canvasWidth?: number
		canvasHeight?: number
		sliderHint?: string
		accuracy?: number
		imageList?: string[]
		pcode?: string
	}>(),
	{
		blockLength: 42,
		blockRadius: 10,
		canvasWidth: 380,
		canvasHeight: 95,
		sliderHint: '向右滑动完成拼图',
		accuracy: 3,
		imageList: () => [],
		pcode: '',
	},
)

const emit = defineEmits<{
	success: [payload: unknown]
	fail: [msg?: string]
	again: []
}>()

const { t } = useI18n()

const sessionId = ref('')
const isFrontCheck = ref(false)
const verifyActive = ref(false)
const verifySuccess = ref(false)
const verifyFail = ref(false)
const blockObj = ref<HTMLCanvasElement | HTMLImageElement | null>(null)
const canvasCtx = ref<CanvasRenderingContext2D | null>(null)
const blockCtx = ref<CanvasRenderingContext2D | null>(null)
const blockWidth = ref(props.blockLength * 2)
const blockX = ref<number | undefined>(undefined)
const blockY = ref<number | undefined>(undefined)
const image = ref<HTMLImageElement | undefined>(undefined)
const originX = ref<number | undefined>(undefined)
const originY = ref<number | undefined>(undefined)
const dragDistanceList = ref<number[]>([])
const sliderBoxWidth = ref(19)
const sliderButtonLeft = ref<string | number>(10)
const isMouseDown = ref(false)
const isLoading = ref(true)
const timestamp = ref<number | null>(null)
const successHint = ref(t('验证通过!'))
const nonceStr = ref<string | undefined>(undefined)
const slideVerifyRootText = ref(t('点击此处进行验证'))
const msgToken = ref<string | undefined>(undefined)

const canvasRef = ref<HTMLCanvasElement | HTMLImageElement>()
const blockRef = ref<HTMLCanvasElement | HTMLImageElement>()

function sum(x: number, y: number) {
	return x + y
}

function square(x: number) {
	return x * x
}

function init() {
	initDom()
	bindEvents()
}

function initDom() {
	blockObj.value = blockRef.value ?? null
	if (isFrontCheck.value) {
		const canvasEl = canvasRef.value as HTMLCanvasElement
		canvasCtx.value = canvasEl.getContext('2d')
		blockCtx.value = (blockRef.value as HTMLCanvasElement).getContext('2d')
		initImage()
	} else {
		isLoading.value = true
		getCaptcha()
	}
}

function getCaptcha() {
	isLoading.value = true
	api('slider.generateCaptcha', {})
		.then((response) => {
			isLoading.value = false
			const data = response.data as {
				sessionId?: string
				sliderImg?: string
				yposition?: number
				backgroundImg?: string
			}
			if (isSuccessCode(response.code)) {
				sessionId.value = data.sessionId ?? ''
				const blockEl = blockRef.value as HTMLImageElement
				const canvasEl = canvasRef.value as HTMLImageElement
				blockEl.src = data.sliderImg ?? ''
				blockEl.style.top = `${data.yposition ?? 0}px`
				canvasEl.src = data.backgroundImg ?? ''
			}
		})
		.catch(() => {
			isLoading.value = false
		})
}

function initImage() {
	const img = createImage(() => {
		drawBlock()
		const {
			canvasWidth,
			canvasHeight,
			blockX: bx,
			blockY: by,
			blockRadius,
		} = {
			canvasWidth: props.canvasWidth,
			canvasHeight: props.canvasHeight,
			blockX: blockX.value!,
			blockY: blockY.value!,
			blockRadius: props.blockRadius,
		}
		const bw = blockWidth.value
		canvasCtx.value!.drawImage(img, 0, 0, canvasWidth, canvasHeight)
		blockCtx.value!.drawImage(img, 0, 0, canvasWidth, canvasHeight)
		const yAxle = by - blockRadius * 2
		const imageData = blockCtx.value!.getImageData(bx, yAxle, bw, bw)
		;(blockObj.value as HTMLCanvasElement).width = bw
		blockCtx.value!.putImageData(imageData, 0, yAxle)
		isLoading.value = false
		nonceStr.value = 'loyer'
	})
	image.value = img
}

function createImage(onload: () => void) {
	const img = document.createElement('img')
	img.crossOrigin = 'Anonymous'
	img.onload = onload
	img.onerror = () => {
		img.src = fallbackSlideBg
	}
	img.src = getImageSrc()
	return img
}

function getImageSrc() {
	const len = props.imageList.length
	const index = getNonceByRange(0, len)
	return len > 0
		? (props.imageList[index] ?? '')
		: `https://loyer.wang/view/ftp/wallpaper/${getNonceByRange(1, 1000)}.jpg`
}

function getNonceByRange(start: number, end: number) {
	return Math.round(Math.random() * (end - start) + start)
}

function drawBlock() {
	blockX.value = getNonceByRange(
		blockWidth.value + 10,
		props.canvasWidth - (blockWidth.value + 10),
	)
	blockY.value = getNonceByRange(
		10 + props.blockRadius * 2,
		props.canvasHeight - (blockWidth.value + 10),
	)
	draw(canvasCtx.value!, 'fill')
	draw(blockCtx.value!, 'clip')
}

function draw(ctx: CanvasRenderingContext2D, operation: 'fill' | 'clip') {
	const PI = Math.PI
	const x = blockX.value!
	const y = blockY.value!
	const l = props.blockLength
	const r = props.blockRadius
	ctx.beginPath()
	ctx.moveTo(x, y)
	ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI)
	ctx.lineTo(x + l, y)
	ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI)
	ctx.lineTo(x + l, y + l)
	ctx.lineTo(x, y + l)
	ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true)
	ctx.lineTo(x, y)
	ctx.lineWidth = 2
	ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
	ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
	ctx.stroke()
	ctx[operation]()
	ctx.globalCompositeOperation = 'destination-over'
}

function bindEvents() {
	const sliderButton = document.getElementById('slider-button')
	if (!sliderButton) return

	sliderButton.addEventListener('mousedown', (event) => {
		startEvent(event.clientX, event.clientY)
	})
	document.addEventListener('mousemove', (event) => {
		moveEvent(event.clientX, event.clientY)
	})
	document.addEventListener('mouseup', (event) => {
		endEvent(event.clientX)
	})
	sliderButton.addEventListener('touchstart', (event) => {
		const touch = event.changedTouches[0]
		if (!touch) return
		startEvent(touch.pageX, touch.pageY)
	})
	document.addEventListener('touchmove', (event) => {
		const touch = event.changedTouches[0]
		if (!touch) return
		moveEvent(touch.pageX, touch.pageY)
	})
	document.addEventListener('touchend', (event) => {
		const touch = event.changedTouches[0]
		if (!touch) return
		endEvent(touch.pageX)
	})
}

function checkImgSrc() {
	if (isFrontCheck.value) return true
	return !!(canvasRef.value as HTMLImageElement)?.src
}

function startEvent(x: number, y: number) {
	if (!checkImgSrc() || isLoading.value || verifySuccess.value) return
	originX.value = x
	originY.value = y
	isMouseDown.value = true
	timestamp.value = +new Date()
}

function moveEvent(x: number, y: number) {
	if (!isMouseDown.value) return false
	const moveX = x - originX.value!
	const moveY = y - originY.value!
	if (moveX < 0 || moveX + 32 >= props.canvasWidth) return false
	sliderButtonLeft.value = `${moveX}px`
	const blockLeft = ((props.canvasWidth - 40 - 20) / (props.canvasWidth - 40)) * moveX
	if (blockObj.value) blockObj.value.style.left = `${blockLeft}px`
	verifyActive.value = true
	sliderBoxWidth.value = moveX + 32
	dragDistanceList.value.push(moveY)
}

function endEvent(x: number) {
	if (!isMouseDown.value) return false
	isMouseDown.value = false
	if (x === originX.value) return false

	isLoading.value = true
	verifyActive.value = false
	timestamp.value = +new Date() - (timestamp.value ?? 0)
	const moveLength = parseInt(blockObj.value?.style.left ?? '0')

	if (timestamp.value > 10000) {
		verifyFailEvent()
	} else if (!turingTest()) {
		verifyFail.value = true
		emit('again')
	} else if (isFrontCheck.value) {
		const accuracy =
			props.accuracy <= 1 ? 1 : props.accuracy > 10 ? 10 : props.accuracy
		const spliced = Math.abs(moveLength - blockX.value!) <= accuracy
		if (!spliced) {
			verifyFailEvent()
		} else {
			verifySuccessEvent()
			emit('success', { nonceStr: nonceStr.value, value: moveLength })
			slideVerifyRootText.value = t('验证通过！')
		}
	} else {
		verifyCaptchaRequest({ sessionId: sessionId.value, moveX: moveLength })
	}
}

function turingTest() {
	const arr = dragDistanceList.value
	const average = arr.reduce(sum) / arr.length
	const deviations = arr.map((x) => x - average)
	const stdDev = Math.sqrt(deviations.map(square).reduce(sum) / arr.length)
	return average !== stdDev
}

function verifySuccessEvent() {
	isLoading.value = false
	verifySuccess.value = true
	const elapsedTime = ((timestamp.value ?? 0) / 1000).toFixed(1)
	if (Number(elapsedTime) < 1) {
		successHint.value = `仅仅${elapsedTime}S，你的速度快如闪电`
	} else if (Number(elapsedTime) < 2) {
		successHint.value = `只用了${elapsedTime}S，这速度简直完美`
	} else {
		successHint.value = `耗时${elapsedTime}S，争取下次再快一点`
	}
}

function verifyFailEvent(msg?: string) {
	verifyFail.value = true
	emit('fail', msg)
	refresh()
}

function refresh() {
	setTimeout(() => {
		verifyFail.value = false
	}, 500)
	isLoading.value = true
	verifyActive.value = false
	verifySuccess.value = false
	if (blockObj.value) blockObj.value.style.left = '0'
	sliderBoxWidth.value = 19
	sliderButtonLeft.value = 0
	if (isFrontCheck.value && canvasCtx.value && blockCtx.value) {
		canvasCtx.value.clearRect(0, 0, props.canvasWidth, props.canvasHeight)
		blockCtx.value.clearRect(0, 0, props.canvasWidth, props.canvasHeight)
		;(blockObj.value as HTMLCanvasElement).width = props.canvasWidth
		if (image.value) image.value.src = getImageSrc()
	} else {
		getCaptcha()
	}
}

function verifyCaptchaRequest(val: { sessionId: string; moveX: number }) {
	api('slider.verifyCaptcha', {
		...val,
		mobile: props.pcode,
	})
		.then((response) => {
			const data = response.data as { success?: boolean; token?: string }
			if (isSuccessCode(response.code) && data.success === true) {
				slideVerifyRootText.value = t('验证通过！')
				verifySuccessEvent()
				msgToken.value = data.token
				setTimeout(() => {
					emit('success', msgToken.value)
				}, 2000)
			} else {
				verifyFailEvent(response.msg)
			}
		})
		.catch((error: Error) => {
			verifyFailEvent(error.message)
		})
}

onMounted(() => {
	init()
})
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
