<template>
	<!-- <div class="welcome">
      <div></div>
  </div> -->

	<el-card style="border: none">
		<el-row>
			<el-col :span="24">
				<div class="welcome"></div>
			</el-col>
		</el-row>
		<!--    <el-row>
      <el-col :span="24" style="text-align: center; color: #fff">
        <el-button type="primary" plain @click="logoutSystem()"
          >退出
        </el-button>
      </el-col>
    </el-row>-->
	</el-card>
</template>

<script>
import { INDEX_MAIN_PAGE_PATH } from '@/store/mutation-types';
import * as tokenUtil from '@/utils/base/token-util';
import { useUserStore } from '@/stores/user';
export default {
	data() {
		return {};
	},
	created() {
		///
	},
	mounted() {},
	methods: {
		logoutSystem() {
			console.log('退出操作');
			useUserStore()
				.Logout()
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
