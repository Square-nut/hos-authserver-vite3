<!-- ca 二次认证弹框 -->
<template>
  <div class="sc-dialog">
    <hos-tabs v-model="activeType" type="separate"  ref="secondLevel" @tab-click="tabClick" v-if="!phoneDisplay">
      <hos-tab-pane :label="item.loginName" v-for="(item,index) in caList" :key="index" :name="item.type">
        <CA
          :key="item.type"
          :CAAUTH="caList"
          :info="item"
          :againLogin="true"
          :activeType="activeType"
          :loginSucessHandler="loginSucessHandler"
          :grantChainId="grantChainId">
        </CA>
      </hos-tab-pane>
    </hos-tabs>
    <div v-else>
      <oauth-otplogin
        :loginSucessHandler="loginSucessHandler"
        :grantChainId="grantChainId"
        :phoneDisplay="phoneDisplay"
        :againLogin="true">
      </oauth-otplogin>
    </div>
  </div>
</template>
<script>
import CA from './ca.vue'
import OauthOtplogin from './oauth-otplogin.vue'
export default {
  name:'',
  components: {CA, OauthOtplogin},
  props:{
    // 当前用户名，用户查询支持的二次认证方式
    account: {
      type:String,
      default:'',
    },
    // 登录时需要传 grantChainId
    grantChainId: {
      type:String,
      default:'',
    },
    // 登录成功的回调
    loginSucessHandler:{
      type:Function,
      default: () => {}
    },
    // 所有支持ca登录的类型
    caList:{
      type: Array,
      default:() => []
    },
    phoneDisplay:{
      type:String,
      default: ''
    },
    grantChainId:{
      type:String,
      default:''
    }
  },
  data(){
    return{
      activeType:'',
    }
  },
  created(){
    if(this.caList[0]) this.activeType = this.caList[0].type
  },
  methods:{
    tabClick(tab, event){
      console.log(this.activeType, this.$t('父页面'))
    },
  }
}
</script>
<style lang="scss" scoped>
.sc-dialog{
  padding: 0 14px;
  // height: 400px;
}
</style>