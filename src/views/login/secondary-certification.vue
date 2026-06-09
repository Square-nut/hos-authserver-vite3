<!-- ca 二次认证弹框 -->
<template>
	<div class="sc-dialog">
		<el-tabs
			v-model="activeType"
			type="separate"
			ref="secondLevel"
			@tab-click="tabClick"
			v-if="!phoneDisplay"
		>
			<el-tab-pane
				:label="item.loginName"
				v-for="(item, index) in caList"
				:key="index"
				:name="item.type"
			>
				<CA
					:key="item.type"
					:CAAUTH="caList"
					:info="item"
					:againLogin="true"
					:activeType="activeType"
					:loginSucessHandler="loginSucessHandler"
					:grantChainId="grantChainId"
				>
				</CA>
			</el-tab-pane>
		</el-tabs>
		<div v-else>
			<oauth-otplogin
				:loginSucessHandler="loginSucessHandler"
				:grantChainId="grantChainId"
				:phoneDisplay="phoneDisplay"
				:againLogin="true"
			>
			</oauth-otplogin>
		</div>
	</div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import CA from './ca.vue'
import OauthOtplogin from './oauth-otplogin.vue'

interface CaListItem {
	type: string
	loginName: string
	[key: string]: unknown
}

const props = defineProps<{
	account?: string
	grantChainId?: string
	loginSucessHandler?: () => void
	caList?: CaListItem[]
	phoneDisplay?: string
}>()

const { t } = useI18n()
const activeType = ref('')

function tabClick() {
	console.log(activeType.value, t('父页面'))
}

onMounted(() => {
	if (props.caList?.[0]) activeType.value = props.caList[0].type as string
})
</script>
<style lang="scss" scoped>
.sc-dialog {
	padding: 0 14px;
	// height: 400px;
}
</style>
