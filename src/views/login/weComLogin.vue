<template>
	<div class="">
		<div id="ww_login" ref="ww_login"></div>
	</div>
</template>
<script>
// import * as ww from '@wecom/jssdk';
import AuthConstant from '@/constant/auth-constant';
import { mapActions } from 'vuex';
import { getLoginErrorDesc } from './js/login';
import { getQueryString, getTopUrl } from '@/utils/base/base-util';

export default {
	props: [
		{
			// 登录成功的回调
			loginSucessHandler: {
				type: Function,
				default: () => {},
			},
		},
	],
	components: {},
	data() {
		return {
			loginPanel: null,
			wwLogin: null,
		};
	},
	created() {},
	mounted() {
		this.wwLogin = new WwLogin({
			id: 'ww_login',

			appid: 'wwfcc31d1f36207b4f',

			agentid: '1000002',

			redirect_uri: 'http://114.251.235.9:8343/',

			state: 'loginState',
			href: 'https://xt.mediway.com.cn/ylxt/css/wx.css',
		});
		console.log(this.wwLogin);
		// 初始化
		// const THAT = this
		// const wwLogin = ww.createWWLoginPanel({
		// 	el: '#ww_login',
		// 	params: {
		// 		login_type: 'CorpApp',
		// 		appid: 'ww61cb705f0253d652',
		// 		agentid: '1000048',
		// 		redirect_uri: 'http://cas.dentalxjtu.com/',
		// 		state: 'loginState',
		// 		redirect_type: 'callback',
		// 		panel_size: 'small',
		// 	},
		// 	onLoginSuccess({ code }) {
		// 		// 登录
		// 		let upData = {
		// 			grantType: 'phoneScan',
		// 			code: code,
		// 		};
		// 		THAT.Login(upData).then(res=>{
		// 			if(res && res.code==200) {
		// 				THAT.loginSucessHandler();
		// 			}else{
		// 				THAT.$message.error(res.msg);
		// 			}
		// 		}).catch((err) => {
		//       let code = err.code;
		//       ///需要双因子认证的错误， 为什么又一次弹出了二次认证弹框
		//       if(code === AuthConstant.wxScanCode){
		//           ///这个需要从respnmse中获取数据,已经从过滤器中处理了
		//           let grantChainId = err.data.weChatUuid;
		//           // let authType = err.data.againAuthType;
		//           let authType = 'otp';
		//           let account = err.data.accountCode
		//           ///弹出层
		//           THAT.$emit("openTwoAuthDialog", grantChainId, authType, account, '', '');
		//       }else{
		//           ///根据返回的编码，从国家化中获取相应的描述
		//           ////公共的错误码的校验
		//           let errorDesc =  getLoginErrorDesc(code,err.msg);
		//           if(!errorDesc||errorDesc==""){
		//               errorDesc= THAT.$t("login.otp.authFailed");
		//           }
		//           THAT.$message.error(err.msg);
		//           // this.$store.commit('CLOSE_DIALOG')
		//       }
		//   });
		// 	},
		// 	onLoginFail(err) {
		// 		console.log('onLoginFail', err);
		// 	},
		// });
		// this.loginPanel = wwLogin;
		// 卸载
		// wwLogin.unmount();
	},
	methods: {
		...mapActions(['Login']),

		loginSucessHandler(toPath) {
			// 不需要二次认证
			this.$emit('loginSucessHandler');
			// if (!toPath) {
			// 		let toCustomPath = getQueryString("redirect");
			// 		if (!toCustomPath) {
			// 				toCustomPath = INDEX_MAIN_PAGE_PATH;
			// 		}
			// 		toPath = toCustomPath;
			// }
			// this.$router.push({ path: toPath });
		},
	},
};
</script>
<style lang="scss" scoped></style>
<style lang="scss"></style>
