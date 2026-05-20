<template>
	<div>
		<div class="authorize" v-if="result">
			<img src="../../assets/images/noData.png" alt="" />
			<div class="text-align-center">{{ result }}</div>
		</div>
		<div v-else>
			<img src="../../assets/images/loading.png" alt="" class="loadding-img" />
		</div>
	</div>
</template>

<script>
import { fetchOauthAuthorize } from '@/api/oauth';
import { getToken } from '@/utils/base/token-util';
import { getLocale } from '@/utils/i18n/i18n-util';
export default {
	name: 'oauth_authorize',
	data() {
		return {
			result: '',
		};
	},
	watch: {},
	created() {
		this.init();
	},
	methods: {
		init() {
			if (document.querySelector('.login-loading-mask'))
				document.querySelector('.login-loading-mask').style.display = 'none';
			// 把参数中的redirect_uri解码再编码
			let urlQuery = this.$route.query;
			const urlParams = new URLSearchParams(urlQuery);
			const paramValue = urlParams.get('redirect_uri');
			let redirect_uri = this.decodeSpecialURI(paramValue);
			redirect_uri = encodeURIComponent(redirect_uri);
			urlParams.set('redirect_uri', redirect_uri);
			const upData = {};
			urlParams.forEach(function (value, key) {
				upData[key] = value;
			});
			const IP = this.$ls.get('IP');
			const MAC = this.$ls.get('MAC');
			if (!upData.scope) upData.scope = 'openid';
			fetchOauthAuthorize(upData)
				.then((response) => {
					//处理回调
					if (response && response.code == 200) {
						// let token = getToken()
						// location.href =response.data.url + `&token=${token}`;
						let redirectUri =
							response.data.redirectUri + '&language=' + getLocale();
						if (IP && MAC) {
							redirectUri =
								redirectUri +
								'&ip=' +
								this.$ls.get('IP') +
								'&mac=' +
								this.$ls.get('MAC');
						}
						location.href = redirectUri;
					} else {
						if (response) {
							this.result = response.msg;
						}
					}
				})
				.catch((e) => {
					this.result = e.msg;
					// this.$m.msg.error("认证失败,请刷新页面后重试")
				});
		},
		// 专门处理包含 %uXXXX 中文编码的 URI 解码
		decodeSpecialURI(str) {
			if (!str) return '';

			str = str.replace(/%u([0-9A-Fa-f]{4})/gi, (match, hex) => {
				return String.fromCharCode(parseInt(hex, 16));
			});

			try {
				return decodeURIComponent(str);
			} catch (e) {
				console.warn('decodeURIComponent 仍然失败，使用备用方案', e);
				return str; // 兜底方案
			}
		},
	},
};
</script>
<style lang="scss" scoped>
.authorize {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
.text-align-center {
	font-size: 16px;
	text-align: center;
}
.loadding-img {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
</style>
