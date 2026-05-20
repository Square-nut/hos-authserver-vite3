<template>
	<div>
		<div class="authorize" >
			<img src="../../assets/images/noData.png" alt="" />
			<div class="text-align-center">{{ result }}</div>
		</div>
	</div>
</template>

<script>
import { fetchOauthAuthorize } from '@/api/oauth';
export default {
	name: 'oauth_error',
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
      let {code, msg} = this.$route.query;
      this.result = msg;
			let upData = {code: code}
			if(!upData.scope) upData.scope = 'openid%20profile'
			fetchOauthAuthorize(upData)
				.then((response) => {
					//处理回调
					if (response && response.code == 200) {
						this.result = response.data;
					} else {
						this.$message.error(response.msg);
					}
				})
				.catch(() => {
					this.$message.error(response.msg);
				});
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
	text-align: center;
}
.loadding-img {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}
</style>
