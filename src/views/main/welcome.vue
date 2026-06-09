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

<script setup lang="ts">
import { INDEX_MAIN_PAGE_PATH } from '@/store/mutation-types'
import { useUserStore } from '@/stores/user'

function logoutSystem() {
	console.log('退出操作')
	useUserStore()
		.Logout()
		.then(() => {
			location.href = INDEX_MAIN_PAGE_PATH
		})
		.catch(() => {
			location.href = INDEX_MAIN_PAGE_PATH
		})
}
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
