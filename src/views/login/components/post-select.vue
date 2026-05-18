<template>
	<div class="post-select">
		<el-select
			v-model="post"
			:data="postList"
			v-bind="$attrs"
			@change="change"
			popper-class="post-select-popper"
			option-value="id"
			option-label="name"
		>
			<template #prefix>
				<el-icon v-if="isHosTheme"><Briefcase /></el-icon>
				<img v-else src="../../../assets/images/login/z61.png" alt="" />
			</template>
		</el-select>
	</div>
</template>
<script>
import { Briefcase } from '@element-plus/icons-vue';

export default {
	components: { Briefcase },
	props: {
		type: String,
		personId: String,
	},
	components: {},
	data() {
		return {
			isHosTheme: String(import.meta.env.VITE_APP_THEME_STYLE) === '1',
			theme: import.meta.env.VITE_APP_THEME_STYLE,
			postList: [],
			post: '',
		};
	},
	created() {},
	methods: {
		// 岗位下拉表格相关逻辑开始
		getPostPage() {
			// 先重置

			this.clear();

			let params = {
				current: 1,
				type: this.type,
				personId: this.personId,
				size: 9999,
			};
			this.$api('selectPostPage', params)
				.then((res) => {
					if (res.code == 200) {
						if (res.data.records && res.data.records.length) {
							this.postList = res.data.records;
							this.post = this.postList[0].id;
							this.$emit('change', this.post, this.postList[0]);
						} else {
							this.clear();
						}
					}
				})
				.catch((err) => {
					this.clear();
				});
		},

		change(val) {
			let post = this.postList.filter((ele) => ele.id == val)[0];
			this.$emit('change', val, post);
			// this.$emit('input', val)
		},
		clear() {
			this.postList = [];
			this.post = '';
		},
	},
};
</script>
