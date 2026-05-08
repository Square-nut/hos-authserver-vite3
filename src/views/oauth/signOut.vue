<template>
	<div>
		{{ result }}
	</div>
</template>
<script>
import { mapActions } from 'vuex';
import { INDEX_MAIN_PAGE_PATH } from '@/store/mutation-types';
export default {
	data() {
		return {};
	},
	created() {
		this.logoutSystem();
	},
	mounted() {},
	methods: {
		...mapActions(['Logout']),
		logoutSystem() {
			//获取退出后的重定向地址
			var servceUrl = this.$route.query.service;
			//调用退出接口
			this.Logout()
				.then((res) => {
					//重定向到指定的地址
					// http://114.251.235.4:8224/oauth/logout?service=应用系统的地址
					location.href = servceUrl;
				})
				.catch((error) => {
					location.href = servceUrl;
				});
		},
	},
};
</script>

<style>
.welcome > div {
	margin-top: 160px;
}
</style>
