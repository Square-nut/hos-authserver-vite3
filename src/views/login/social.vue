<template>
	<!--<div>
            &lt;!&ndash; <el-tag  :key="index" v-if="item.enable" @click="handleClick(item.code)"><i :class="item.icon"></i>{{item.name}}</el-tag>&ndash;&gt;
           &lt;!&ndash; <el-avatar style="margin-left: 10px" v-if="item.enable" v-for="(item,index) in sourceData" @click.native="handleClick(item.code)"
                        size="small" :src="item.url" :alt="item.name">
            </el-avatar>&ndash;&gt;
            <img v-if="item.enable" :src="item.url" :alt="item.name" v-for="(item,index) in sourceData" @click.native="handleClick(item.code)" />
            &lt;!&ndash;<el-button type="info" circle  :icon="item.icon" v-if="item.enable" v-for="(item,index) in sourceData" @click.native="handleClick(item.code)" >{{item.name}}</el-button>&ndash;&gt;
    </div>-->

	<el-row>
		<el-col :span="12">{{ t('第三方登录方式') }}</el-col>
		<el-col :span="12">
			<template v-for="(item, index) in sourceData" :key="item.code + index">
				<img
					v-if="item.enable"
					:id="item.code"
					:src="item.url"
					:alt="item.name"
					@click="handleClick(item.code)"
				/>
			</template>
		</el-col>
	</el-row>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import hosUrl from '@/assets/images/social/hos.png'
import giteeUrl from '@/assets/images/social/gitee.png'
import weixinUrl from '@/assets/images/social/weixin.png'
import { fetchOauthUrl } from '@/api/oauth'

defineOptions({ name: 'SocialLogin' })

const props = defineProps<{
	getSocialData: () => { sourceData: string[]; isSingle?: boolean }
	saveWindow: (win: Window | null) => void
	grantChainId?: string
}>()

const { t } = useI18n()

interface SocialSource {
	name: string
	code: string
	enable: boolean
	url: string
}

const isShow = ref(false)
const sourceData = ref<SocialSource[]>([
	{ name: 'QQ', code: 'QQ', enable: false, url: 'el-icon-s-flag' },
	{ name: '微信', code: 'WECHAT_OPEN', enable: false, url: weixinUrl },
	{ name: 'GITEE', code: 'GITEE', enable: false, url: giteeUrl },
	{ name: 'hos', code: 'hos', enable: false, url: hosUrl },
])

function getTwoAuthUUID() {
	return props.grantChainId
}

function initData(val: { sourceData: string[]; isSingle?: boolean }) {
	const data = val.sourceData
	const handleData: SocialSource[] = []
	for (let i = 0; i < sourceData.value.length; i++) {
		const source = sourceData.value[i]
		if (!source) continue
		const item = { ...source }
		if (
			data.indexOf(item.code.toUpperCase()) > -1 ||
			data.indexOf(item.code.toLowerCase()) > -1
		) {
			item.enable = true
		}
		handleData.push(item)
	}
	sourceData.value = handleData
	if (data.length == 1 && val.isSingle) {
		handleClick(data[0]!)
		isShow.value = false
	} else {
		isShow.value = true
	}
}

function handleClick(source: string) {
	fetchOauthUrl(source)
		.then((response) => {
			if (response && response.code == 200) {
				const url = response.data as string
				const winWidth = screen.width
				const newWinHeight = '500'
				const newWinWidth = '1000'
				const left = (winWidth - Number(newWinWidth)) / 2
				const winObj = window.open(
					url,
					'_blank',
					'width=' +
						newWinWidth +
						',height=' +
						newWinHeight +
						',left=' +
						left +
						',top=100,toolbar=no,menubar=no,location=no,status=no',
				)
				props.saveWindow(winObj)
			} else {
				ElMessage.error(response?.msg ?? '')
			}
		})
		.catch((error) => {
			console.log(error)
		})
}

onMounted(() => {
	;(window as unknown as Record<string, unknown>).getTwoAuthUUID = () =>
		getTwoAuthUUID()
	initData(props.getSocialData())
})
</script>
