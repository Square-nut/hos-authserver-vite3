<template>
	<div class="post-select-table">
		<el-biz-select-table-2
			v-model="postValue"
			v-bind="$attrs"
			:uid="uid + '-Table'"
			pagePos="bottom"
			header-row-class-name="login-biz-table-header"
			tooltip-effect="select-table-tooltip"
			height="200px"
			popover-width="545px"
			:ref="uid + '-Table'"
			:cols="cols"
			:valueConfig="valueConfig"
			:form="form"
			:table-data="selectPostPage"
			:init="false"
			:stripe="false"
			:border="false"
			:page="pageConfig"
			:rowDisabledMethod="rowDisabledMethod"
			@after-load="tableLoadAfter"
			@change="changePeople"
		>
			<template #form>
				<el-row :gutter="20">
					<!-- 业务单元 -->
					<el-col :span="11">
						<el-form-item :label="$t('业务单元')" label-width="80px">
							<el-input
								@input="searchPost($event, 'type')"
								v-model="form.model.queryBuName"
								:placeholder="$t('业务单元')"
								clearable
							></el-input>
						</el-form-item>
					</el-col>
					<!-- 岗位 -->
					<el-col :span="11">
						<el-form-item :label="$t('业务岗位')" label-width="80px">
							<el-input
								v-model="form.model.queryPostName"
								clearable
								:placeholder="$t('业务岗位')"
								@input="searchPost($event, 'name')"
							></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</template>
		</el-biz-select-table-2>
	</div>
</template>
<script setup lang="ts">
import { getCurrentInstance } from 'vue'

const vm = getCurrentInstance()!

function refresh() {
	;(vm.proxy as { refresh: () => void }).refresh()
}

function clear() {
	;(vm.proxy as { clear: () => void }).clear()
}

defineExpose({ refresh, clear })
</script>
<script>
import { fetchSelectPostPage } from '@/api/org'

export default {
	props: {
		type: String,
		personId: String,
		uid: String,
	},
	components: {},
	data() {
		return {
			pageConfig: {
				pageSize: 5,
			},
			postValue: '',
			form: {
				labelWidth: 'auto',
				labelPosition: 'left',
				model: {
					queryBuName: '',
					queryPostName: '',
				},
			},
			postList: [],
			cols: [
				// {
				// 	prop: 'name',
				// 	label: this.$t('名称'),
				// 	width: '150px',
				// },
				// {
				// 	prop: 'type',
				// 	label: this.$t('类型'),
				// 	width: '80px',
				// 	formatter: (row, column, value) => {
				//     return row.type == 'unit' ? this.$t('岗位单元') : row.type == 'group' ? this.$t('岗位组') : this.$t('岗位')
				//   },
				// },
				{
					label: this.$t('业务单元'),
					prop: 'buName',
				},
				{
					label: this.$t('业务岗位'),
					prop: 'postName',
				},
			],
			valueConfig: {
				label: 'name',
				value: 'id',
			},
			options: [
				{
					label: this.$t('岗位单元'),
					value: 'unit',
				},
				{
					label: this.$t('岗位组'),
					value: 'group',
				},
				{
					label: this.$t('岗位'),
					value: 'post',
				},
			],
		};
	},
	created() {
		if (
			import.meta.env.VITE_APP_THEME_STYLE == '1'
		) {
			this.pageConfig.layout = 'total, home, prev, pager, next, end';
		}
	},
	mounted() {
		this.$refs[this.uid + '-Table'].fitHeight(200); // 调用fitHeight将tableHeight传给bizTable
	},
	methods: {
		refresh() {
			this.$refs[this.uid + '-Table'].refresh();
		},
		selectPostPage(params) {
			params.type = this.type;
			params.personId = this.personId;
			return fetchSelectPostPage(params);
		},
		// 列表加载完数据
		tableLoadAfter(data) {
			// 自动赋值
			if (Array.isArray(data) && data.length) {
				this.postList = data;
				// 避免重复赋值
				if (this.postValue == '') {
					this.postValue = data[0].id;
					let post = data[0];
					this.$emit('change', this.postValue, post);
				}
			} else {
				this.clear();
			}
		},
		searchPost(val, key) {
			this.$refs[this.uid + '-Table'].refresh();
		},
		rowDisabledMethod(row) {
			return row.activity === false;
		},
		changePeople(val) {
			let post = this.postList.filter((ele) => ele.id == val)[0];
			this.$emit('change', val, post);
			// this.$emit('input', val)
		},
		clear() {
			this.postList = [];
			this.postValue = '';
		},
	},
};
</script>
<style lang="scss" scoped></style>
<style lang="scss">
.post-select-table .el-input__prefix {
	left: 0;
}
</style>
