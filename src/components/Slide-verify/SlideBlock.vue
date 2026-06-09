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
		<el-slider v-model="internalValue" @input="input" @change="change" :disabled="disabled" :show-tooltip="false" />
		<!--滑动条提示文字-->
		<div class="slider-hint">{{ sliderHint }}</div>
	</div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'sliderVerify' })

const props = withDefaults(
	defineProps<{
		resetSlider?: string
		value?: number
		blockLength?: number
		blockRadius?: number
		canvasWidth?: number
		canvasHeight?: number
		successIcon?: string
		startIcon?: string
		barBackground?: string
		accuracy?: number
		disabled?: boolean
	}>(),
	{
		resetSlider: '',
		value: 0,
		blockLength: 42,
		blockRadius: 10,
		canvasWidth: 350,
		canvasHeight: 155,
		successIcon: '✓',
		startIcon: '→',
		barBackground: 'linear-gradient(90deg,rgba(0, 255, 211, 0) 0%,#00ffd3 100%)',
		accuracy: 3,
		disabled: true,
	},
)

const emit = defineEmits<{
	input: [val: number]
	change: [val: number]
	success: [payload?: { nonceStr?: string; value?: number }]
	again: []
	fail: [msg?: string]
}>()

const { t } = useI18n()

const internalValue = ref(props.value)
const isFrontCheck = ref(true)
const verifyActive = ref(false)
const verifySuccess = ref(false)
const verifyFail = ref(false)
const blockObj = ref<HTMLElement | null>(null)
const canvasCtx = ref<CanvasRenderingContext2D | null>(null)
const blockCtx = ref<CanvasRenderingContext2D | null>(null)
const blockWidth = ref(props.blockLength * 2)
const blockX = ref<number | undefined>(undefined)
const blockY = ref<number | undefined>(undefined)
const image = ref<HTMLImageElement | undefined>(undefined)
const originX = ref<number | undefined>(undefined)
const originY = ref<number | undefined>(undefined)
const dragDistanceList = ref<number[]>([])
const sliderBoxWidth = ref<number | string>(0)
const sliderButtonLeft = ref<number | string>(0)
const isMouseDown = ref(false)
const isLoading = ref(true)
const timestamp = ref<number | null>(null)
const successHint = ref('')
const nonceStr = ref<string | undefined>(undefined)
const sliderHint = ref(t('请按住滑块，拖动到最右边'))
const startPosition = ref(0)
const newPosition = ref(0)

const currentPosition = computed(() => {
	return '100%'
})

watch(
	() => props.resetSlider,
	(val) => {
		console.log('ac in watch value', val)
		internalValue.value = 0
		input(0)
	},
)

onMounted(() => {
	addIcon()
	const bar = document.querySelector('.el-slider__bar') as HTMLElement | null
	if (bar) bar.style.background = props.barBackground
})

function addIcon() {
	const el = document.createElement('span')
	el.className = 'slide-block-btn-icon'
	el.textContent = props.startIcon
	document.querySelector('.el-slider__button-wrapper')?.append(el)
}

function input(val: number) {
	emit('input', val)
	if (val === 0) {
		sliderHint.value = t('请按住滑块，拖动到最右边')
		const wrapper = document.querySelector('.el-slider__button-wrapper') as HTMLElement | null
		if (wrapper) {
			wrapper.style.color = '#000'
			wrapper.style.background = '#fff'
			const icon = wrapper.querySelector('.slide-block-btn-icon')
			if (icon) icon.textContent = props.startIcon
			const hint = document.querySelector('.slider-hint') as HTMLElement | null
			if (hint) hint.style.color = '#9296A1'
		}
	} else if (val > 0 && val < 95) {
		sliderHint.value = ''
		const wrapper = document.querySelector('.el-slider__button-wrapper') as HTMLElement | null
		const bar = document.querySelector('.el-slider__bar') as HTMLElement | null
		const hint = document.querySelector('.slider-hint') as HTMLElement | null
		if (wrapper) {
			wrapper.style.background = '#5386FF'
			wrapper.style.color = '#fff'
			const icon = wrapper.querySelector('i')
			if (icon) icon.className = props.startIcon
			addClass(wrapper, 'is-moving')
		}
		if (bar) {
			bar.style.borderColor = '#7EA4FF'
			bar.style.background = '#E9EFFF'
		}
		if (hint) hint.style.color = '#9296A1'
	} else if (val > 95) {
		verifySuccess.value = true
		internalValue.value = 100
		const wrapper = document.querySelector('.el-slider__button-wrapper') as HTMLElement | null
		const bar = document.querySelector('.el-slider__bar') as HTMLElement | null
		const hint = document.querySelector('.slider-hint') as HTMLElement | null
		const icon = wrapper?.querySelector('.slide-block-btn-icon')
		if (icon) icon.textContent = props.successIcon
		if (wrapper) {
			wrapper.style.background = '#41B349'
			wrapper.style.color = '#fff'
			addClass(wrapper, 'is-moving')
		}
		if (bar) {
			bar.style.borderColor = '#41B349'
			bar.style.background = '#EBF7EC'
		}
		if (hint) hint.style.color = '#19A323'
		sliderHint.value = t('验证通过！')
		emit('success')
	}
}

function change(val: number) {
	if (val < 95) {
		internalValue.value = 0
		emit('change', val)
	}
}

function init() {
	initDom()
	bindEvents()
}

function initDom() {
	if (isFrontCheck.value) {
		// front-check canvas init omitted
	} else {
		getCaptcha()
	}
}

function getCaptcha() {
	// backend captcha fetch omitted
}

function checkImgSrc() {
	if (isFrontCheck.value) {
		return true
	}
	return false
}

function startEvent(event: MouseEvent | TouchEvent) {
	console.log('clientX' in event ? event.clientX : '', 'startEvent')
	event.preventDefault()
	if (isLoading.value || verifySuccess.value) {
		return
	}
	let clientX = (event as MouseEvent).clientX
	let clientY = (event as MouseEvent).clientY
	if (event.type === 'touchstart') {
		const touch = (event as TouchEvent).touches[0]
		if (touch) {
			clientY = touch.clientY
			clientX = touch.clientX
		}
	}
	originX.value = clientX
	timestamp.value = +new Date()
	onDragStart(event, clientX, clientY)
	window.addEventListener('mousemove', moveEvent)
	window.addEventListener('touchmove', moveEvent)
}

function moveEvent(event: MouseEvent | TouchEvent) {
	console.log('clientX' in event ? event.clientX : '', 'moveEvent', isMouseDown.value)
	event.preventDefault()
	if (!isMouseDown.value) {
		return false
	}
	const moveX = (event as MouseEvent).clientX - (originX.value ?? 0)
	sliderButtonLeft.value = moveX + 'px'
	verifyActive.value = true
	sliderBoxWidth.value = moveX + 'px'
}

function endEvent(event: MouseEvent | TouchEvent) {
	event.preventDefault()
	if (!isMouseDown.value) {
		return false
	}
	isMouseDown.value = false
	if ((event as MouseEvent).clientX === originX.value) {
		return false
	}
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
		const spliced = Math.abs(moveLength - (blockX.value ?? 0)) <= accuracy
		if (!spliced) {
			verifyFailEvent()
		} else {
			emit('success', { nonceStr: nonceStr.value, value: moveLength })
		}
	} else {
		emit('success', { nonceStr: nonceStr.value, value: moveLength })
	}
}

function turingTest() {
	const arr = dragDistanceList.value
	const sum = (a: number, b: number) => a + b
	const square = (x: number) => x * x
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
	sliderBoxWidth.value = 0
	sliderButtonLeft.value = 0
	if (isFrontCheck.value) {
		const { canvasWidth, canvasHeight } = props
		canvasCtx.value?.clearRect(0, 0, canvasWidth, canvasHeight)
		blockCtx.value?.clearRect(0, 0, canvasWidth, canvasHeight)
		if (blockObj.value) blockObj.value.style.width = canvasWidth + 'px'
	} else {
		getCaptcha()
	}
}

function onDragStart(
	event: MouseEvent | TouchEvent,
	clientX?: number,
	_clientY?: number,
) {
	isMouseDown.value = true
	let x = clientX ?? (event as MouseEvent).clientX
	if (event.type === 'touchstart' && clientX === undefined) {
		const touch = (event as TouchEvent).touches[0]
		if (touch) x = touch.clientX
	}
	originX.value = x
	startPosition.value = parseFloat(currentPosition.value)
	newPosition.value = startPosition.value
}

function addClass(element: Element, className: string) {
	if (element.classList) {
		element.classList.add(className)
	} else {
		;(element as HTMLElement).className += ' ' + className
	}
}

function bindEvents() {
	// event binding omitted in original active code path
}
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
	.el-slider {
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
	.el-slider__runway {
		background: transparent;
		&.disabled {
			.el-slider__bar {
				background: linear-gradient(90deg,rgba(0, 255, 211, 0) 0%,#00ffd3 100%);
			}
			.el-slider__button-wrapper:hover {
				cursor: auto;
			}
		}
		.el-slider__bar {
			height: 43px;
			top: -15px;
			background: linear-gradient(90deg,rgba(0, 255, 211, 0) 0%,#00ffd3 100%);
		}
	}
	.el-slider__button-wrapper {
		top: -16px;
		width: 45px;
		height: 45px;
		background: #41a5ff;
		border-radius: 5px;
		box-shadow: 0px 0 4px rgba(0, 0, 0, 0.3);
		transform: translate(0);
		.slide-block-btn-icon {
			color: #fff;
			font-size: 16px;
			line-height: 45px;
		}
		.el-slider__button {
			display: none;
		}
		.is-moving {
			background: #5386FF;
			color: #fff;
		}
	}
}
</style>
