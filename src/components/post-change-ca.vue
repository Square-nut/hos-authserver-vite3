<!-- 用于岗位切换时强制选择ca· -->
 <!-- ca 二次认证弹框 -->
 <template>
  <div class="p15">
    <hos-tabs v-model="activeType" type="separate"  ref="secondLevel" @tab-click="tabClick" v-if="!phoneDisplay">
      <hos-tab-pane :label="item.loginName" v-for="(item,index) in caList" :key="index" :name="item.type + index">
        <CA
          :key="item.type"
          :CAAUTH="caList"
          :info="item"
          :isAgainLogin="true"
          :activeType="activeType"
          :loginSucessHandler="loginSucessHandler"
          custom-login
          is-post>
        </CA>
      </hos-tab-pane>
    </hos-tabs>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import CA from '@/views/login/ca.vue'

interface CaListItem {
	type: string
	loginName: string
	[key: string]: unknown
}

const props = defineProps<{
	account?: string
	loginSucessHandler?: () => void
	caList?: CaListItem[]
	phoneDisplay?: string
	grantChainId?: string
}>()

const activeType = ref('')

function tabClick() {}

onMounted(() => {
	if (!props.phoneDisplay && props.caList?.[0]) {
		activeType.value = props.caList[0].type + '0'
	}
})
</script>
<style lang="scss" scoped>
.sc-dialog{
  padding: 0 14px;
  // height: 400px;
}
</style>
