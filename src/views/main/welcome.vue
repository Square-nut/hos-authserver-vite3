<template>
	<!-- <div class="welcome">
      <div></div>
  </div> -->

	<hos-card style="border: none">
		<hos-row>
			<hos-col :span="24">
				<div class="welcome"></div>
			</hos-col>
		</hos-row>
		<!--    <hos-row>
      <hos-col :span="24" style="text-align: center; color: #fff">
        <hos-button type="primary" plain @click="logoutSystem()"
          >退出
        </hos-button>
      </hos-col>
    </hos-row>-->
	</hos-card>
</template>

<script>
import { mapActions } from 'vuex';
import { INDEX_MAIN_PAGE_PATH } from '@/store/mutation-types';
import * as tokenUtil from '@/utils/base/token-util';
export default {
	data() {
		return {};
	},
	created() {
		///
	},
	mounted() {},
	methods: {
		...mapActions(['Logout']),
		logoutSystem() {
			console.log('退出操作');
			this.Logout()
				.then((res) => {
					location.href = INDEX_MAIN_PAGE_PATH;
					// this.$router.push({path: INDEX_MAIN_PAGE_PATH});
				})
				.catch((error) => {
					location.href = INDEX_MAIN_PAGE_PATH;
					// this.$router.push({path: INDEX_MAIN_PAGE_PATH});
				});
		},
	},
};
</script>

<style>
.welcome {
	margin-top: 160px;
	width: 400px;
	height: 320px;
	margin: 0 auto;
	line-height: 450px;
	background: url(../../assets/images/welcome.png) no-repeat;
}
</style>
