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
<script>
import CA from '@/views/login/ca.vue'
export default {
  name:'',
  components: {CA},
  props:{
    // 当前用户名，用户查询支持的二次认证方式
    account: {
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
    if(!this.phoneDisplay){
      this.activeType = this.caList[0].type + '0'
    }
    
  },
  methods:{
    tabClick(tab, event){},
  }
}
</script>
<style lang="scss" scoped>
.sc-dialog{
  padding: 0 14px;
  // height: 400px;
}
</style>