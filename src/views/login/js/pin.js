import { Base64 } from 'js-base64'
import { fetchAuthPinPhone } from '@/api/ca'
export const pinMixinData = {
  data(){
    return{
      pinForm:{
        accountCode:'',
        passwordPin:'',
      }, // PIN码登录表单
      pinRules:{
        accountCode:[{required: true, trigger: "blur", message:this.$t('请输入用户名')}],
        passwordPin:[{required: true, trigger: "blur", message:this.$t('请输入PIN码')}],
      },
      // PIN码登录返回值 登录时需要传参
      pinPhoneToken:'',
    }
  },
  methods:{
    // PIN码登录
    pinLogin(formName){
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.authPinPhone()
        } else{
          return false;
        }
      })
    },
    // PIN码登录接口
    authPinPhone(){
      let upData = {
        venderCode: this.info.venderCode,   // 厂商代码
        loginType: this.info.loginType,   // 签名方式代码
        accountCode:this.pinForm.accountCode, // 用户名
        passwordPin: Base64.encode(this.pinForm.passwordPin), // PIN码
      }
      fetchAuthPinPhone(upData).then((res) => {
        if(res && res.code == "200"){
          this.pinPhoneToken = res.data.phoneToken

          // 登录
          let upData = {
            grantType: "ca",
            caPhoneToken:this.pinPhoneToken,
            venderCode: this.info.venderCode,   // 厂商代码
            loginType: this.info.loginType,   // 签名方式代码
          }
          this.login(upData)
        }
      })
    },
  }
}