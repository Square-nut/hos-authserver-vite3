<template>
	<div class="post-select">
		<hos-select
			v-model="post"
			:data="postList"
      v-bind="$attrs"
      @change="change"
			popper-class="post-select-popper"
			option-value="id"
			option-label="name"
		>
			<i v-if="theme" class="hos-input__icon hos-icom-post" slot="prefix"></i>
			<img v-else src="../../../assets/images/login/z61.png" class=" " slot="prefix" />
		</hos-select>
	</div>
</template>
<script>
export default {
	props: {
		type: String,
		personId: String
  },
	components: {},
	data() {
		return {
			theme:
				import.meta.env.VITE_APP_SIMPLE_ONCE ??
				import.meta.env.VUE_APP_SIMPLE_ONCE,
			postList: [],
			post: ''
		};
	},
	created() {},
	methods: {
		// 岗位下拉表格相关逻辑开始
		getPostPage() {
			// 先重置
			
			this.clear()
			
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
							this.$emit('change', this.post, this.postList[0])
						} else {
							this.clear()
						}
					}
				})
				.catch((err) => {
					this.clear()
				});
		},

    change(val){
			let post = this.postList.filter((ele) => ele.id == val)[0];
      this.$emit('change', val, post)
      // this.$emit('input', val)
    },
    clear() {
      this.postList = [];
      this.post = '';
    }
  },
};
</script>
<style lang="scss" scoped>

</style>
<style lang="scss">
</style>
