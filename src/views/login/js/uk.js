// 此文件为 UKEY 登录的 mixins 混入到 ca.vue 中
// 参数定义以 uk 开头 避免参数冲突
import { loadCaVendorExports } from '@/utils/load-ca-vendor';

export const ukMixinData = {
  data(){
    return {
      ukSelectArray:[], // uk下拉框数组
      ukFunction:{},  // UK js文件中导出的函数
      ukForm:{
        strContainerName:'', // 下拉框值
        ukeyPassword:'', // 密码
        post: ''

      }, // uk 表单
      ukDefaultForm:{}, // uk 接口返回默认参数
      // uk 表单校验
      ukRules:{
        ukeyPassword:[{required: true, trigger: "blur", message: this.$t('请输入密码')}],
        strContainerName:[{required: true, trigger: "blur", message:this.$t('请选择UKEY')}]
      },
    }
  },
  created(){
    if(this.info.loginType === 'UKEY' && this.againLogin !== true){
      this.requireUKJS().then(() => {
        this.analysis()
        this.getCAInitParams()
      }).catch((err) => {
        console.error('[CA UKEY] vendor script load failed:', err)
      })
    }
  },
  methods:{
    /**
     * 按接口下发的 `jsPath` 从 `public/ca/` 动态加载厂商脚本（ESM）。
     * 路径兼容旧数据：`ca/xxx.js`、仅文件名、`ca-vendor/xxx.js`（旧目录名）等，见 `load-ca-vendor.ts`。
     */
    requireUKJS(){
      const item = this.info;
      if(item.loginType !== 'UKEY' || !item.jsPath){
        return Promise.resolve();
      }
      return loadCaVendorExports(String(item.jsPath)).then((mod) => {
        this.ukFunction = mod;
      });
    },
    // 解析 uk下拉框字符串转数组
    analysis(){
      // 重置uk下拉框数据
      this.ukSelectArray = []
      console.log(this.ukFunction, 'this.ukFunction')
      // uk返回的字符串格式   uk的名字||ukcode&&&下一个uk名字||ukcode2
      
      let selectStr =  this.ukFunction.GetUserList() // uk 返回的字符串

      let temp = selectStr.split('&&&')  // 切割字符串  ['uk名字||ukcode', '下一个uk名字||ukcode2']
      // 遍历 temp 数组
      for(let i = 0; i < temp.length; i++){
        let item = temp[i] // 'uk名字||ukcode'
        if(item == '') continue
        let s = item.split('||') // 切割每个uk的 label 和 value
        let obj = {
          label: s[0], // uk的名字
          value: s[1], // ukcode
        }
        // 保存处理好的数组
        this.ukSelectArray.push(obj)
      }
      // 下拉框默认选中第一个数据
      if(this.ukSelectArray.length > 0){
        this.ukForm.strContainerName = this.ukSelectArray[0].value || '';
      }
    },
    // uk 登录
    ukLogin(formName){
      this.$refs[formName].validate((valid) => {
        if (valid) {
          window.strServerRan = this.ukDefaultForm.strServerRan;
          // uk登录先调用 uk 文件中的 Login 方法
          // Login({}, 下拉框的value, 密码)  return  1 成功  0 密码错误
          let loginState = this.ukFunction.Login({}, this.ukForm.strContainerName, this.ukForm.ukeyPassword)
          // 登录成功继续走登录流程
          if(loginState || (loginState === 1)){
            // 获取ca uk登录签名
            let autographObj = this.getCAautograph()
            // 登录接口参数整合
            let upData = Object.assign({
              grantType:'ca',
              accountCode:'', // 用户code，可以为空（单独认证时传空）
              loginType: this.info.loginType,   // 签名方式代码
              venderCode: this.info.venderCode,   // 厂商代码
              caUkeyPin:this.$m.crypt(this.ukForm.ukeyPassword), // 加密密码
              certContainer: this.ukForm.strContainerName
              // 接口返回参数        // 各种签名
            },this.ukDefaultForm, autographObj)
            // , this.ukForm.post

            if (this.postChainId) {
              upData.postChainId = this.postChainId;
              upData.post = this.ukForm.post
            }
            // 调用之前登录接口
            this.login(upData)
          }
        } else {
          return false;
        }
      });
    },
    // 获取 ca uk签
    getCAautograph(){
      let autographObj = {
        // 客户端签名
        strClientSignedData:this.ukFunction.SignedData(this.ukDefaultForm.strServerRan, this.ukForm.strContainerName),
        // 客户端证书
        cert:this.ukFunction.GetSignCert(this.ukForm.strContainerName),
        // 用户证书编号
        certNo:this.ukFunction.GetCertNo(this.ukForm.strContainerName)
      }
      // CA用户唯一标识
      autographObj.userCertCode = this.ukFunction.GetUniqueID(autographObj.cert,this.ukForm.strContainerName)
      return autographObj
    },
    // 获取UK初始化参数
    getCAInitParams(){
      let upData = {
        venderCode: this.info.venderCode,   // 厂商代码
        loginType: this.info.loginType,   // 签名方式代码
      }
      this.$api('ca.getCAInitParams', upData).then((res) => {
        if(res && res.code == "200"){
          this.ukDefaultForm = res.data
        }
      })
    },

		changePost(id, post) {
			console.log('ac in changePost. post:', id, post);
			this.ukForm.post = post;
		},
  }
}