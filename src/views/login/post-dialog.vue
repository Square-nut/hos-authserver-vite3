<template>
	<div class="pl15 pr15 pt15 login-post-dialog">
		<el-biz-table
			ref="post-dialog-select-table"
			:cols="cols"
			:form="form"
			:data="selectPostPage"
			:stripe="false"
			:border="false"
			highlight-current-row
			:page="pageConfig"
			uid="post-dialog-select-table"
			@row-dblclick="onRowDblclick"
			@current-change="changePeople"
			header-row-class-name="login-biz-table-header"
			@after-load="tableLoadAfter"
		>
			<template #form>
				<el-row :gutter="20">
					<!-- 业务单元 -->
					<el-col :span="8">
						<el-form-item :label="$t('业务单元')">
							<el-input
								v-model="form.model.queryBuName"
								:placeholder="$t('请输入业务单元')"
								clearable
							></el-input>
						</el-form-item>
					</el-col>
					<!-- 岗位 -->
					<el-col :span="8">
						<el-form-item :label="$t('业务岗位')">
							<el-input
								v-model="form.model.queryPostName"
								clearable
								:placeholder="$t('请输入业务岗位')"
							></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item>
							<el-biz-button run="form.search" type="primary">{{
								$t('查询')
							}}</el-biz-button>
							<el-biz-button run="form.reset" @click="reset">{{
								$t('重置')
							}}</el-biz-button>
						</el-form-item>
					</el-col>
				</el-row>
			</template>
		</el-biz-table>

		<div class="dialog-footer">
			<el-button
				class="margin-t-5"
				v-has-permi="{ key: 'base:perm:role:cancel' }"
				@click="cancel"
				>{{ $t('取消') }}</el-button
			>
			<el-button
				type="success"
				class="margin-t-5"
				@click="save"
				:loading="loading"
				:disabled="disabled"
			>
				{{ $t('确认') }}
			</el-button>
		</div>
	</div>
</template>
<script>
import { useUserStore } from '@/stores/user';
import { closeHosBizDialog, updateHosBizTable } from '@/composables/useHosBiz';
export default {
	// TODO 处理dialogUid，handleRowClick传参
	props: [
		'postData',
		'personId',
		'postChainId',
		'name',
		'openTwoAuthDialog',
		'loginSucessHandler',
		'dialogUid',
		'handleRowClick',
	],
	components: {},
	data() {
		return {
			disabled: true,
			pageConfig: {
				pageSize: 5,
			},
			post: '',
			form: {
				labelWidth: 'auto',
				labelPosition: 'left',
				model: {
					query: '',
					dataType: '',
				},
			},
			cols: [
				// {
				// 	prop: 'name',
				// 	label: this.$t('名称'),
				// },
				// {
				// 	prop: 'type',
				// 	label: this.$t('类型'),
				// 	formatter: (row, column, value) => {
				// 		return row.type == 'unit'
				// 			? this.$t('岗位单元')
				// 			: row.type == 'group'
				// 			? this.$t('岗位组')
				// 			: this.$t('岗位');
				// 	},
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
			loading: false,
			loginForm: {},
		};
	},
	created() {
		if (
			import.meta.env.VITE_APP_THEME_STYLE == '1'
		) {
			this.pageConfig.layout = 'total, home, prev, pager, next, end';
		}
		if (this.dialogUid) {
			// this.$refs['post-dialog-select-table'].setCurrentRow(row);
			// this.handleRowClick(this.post)
		}
		// this.$refs.singleTable.setCurrentRow(row);
	},
	methods: {
		onRowDblclick(row, column, event) {
			this.post = row;
			this.loading = true;
			this.disabled = true;
			// 选择岗位支持双击切换
			this.loginFn();
		},
		save() {
			// 有dialogUid代表是登录后dropdownMenu调用
			if (this.dialogUid) {
				this.handleRowClick(this.post);
			} else {
				this.loginFn();
			}
		},
		cancel() {
			if (this.dialogUid) {
				closeHosBizDialog({
					_uid: 'dropmenu-post-change-dialog',
				});
			} else {
				closeHosBizDialog({ _uid: 'postDialog' });
			}
		},
		// 登录
		loginFn() {
			let postData = JSON.parse(JSON.stringify(this.postData));
			postData.postChainId = this.postChainId;
			postData.post = this.post;
			if (!this.post) {
				this.$message.error(this.$t('请选择岗位单元！'));
				return;
			}
			this.loading = true;
			this.disabled = true;
			useUserStore().Login(postData)
				.then((res) => {
					this.loading = false;
					// 登录成功跳转
					if (res && res.code == 200) {
						if (res.data.againAuthType) {
							// 需要二次认证
							let grantChainId = res.data.grantChainId;
							let authType = res.data.againAuthType;
							let account = res.data.accountCode;
							let caData = res.data.caData;
							let phone = res.data.phone;
							this.openTwoAuthDialog(
								grantChainId,
								authType,
								account,
								caData,
								phone
							);
						} else {
							// 不需要二次认证
							this.loginSucessHandler();
						}
					}
				})
				.catch((err) => {
					this.loading = false;
					if (!err.code.includes('101-002-005-')) {
						this.$message.error(err.msg);
					}
				});
		},
		selectPostPage(params) {
			params.type = 'id';
			params.personId = this.personId;
			params.size = 5;
			return this.$api('selectPostPage', params);
		},

		searchPost(val, key) {
			this.$refs.people.refresh();
		},
		rowDisabledMethod(row) {
			return row.activity === false;
		},
		changePeople(row) {
			this.post = row;
			this.disabled = false;
		},
		reset() {
			this.form.model = {
				query: '',
				dataType: '',
			};
			this.post = '';
			this.disabled = true;
			updateHosBizTable({ _uid: 'post-dialog-select-table' });
		},

		// 列表加载完数据
		tableLoadAfter(data) {
			// 自动赋值
			if (Array.isArray(data) && data.length) {
				this.$refs['post-dialog-select-table'].setCurrentRow(data[0]);
			}
		},
	},
};
</script>
<style lang="scss" scoped>
.pl15 {
	padding-left: 15px;
}
.login-post-dialog {
	// ie浏览器不能自动撑开高度
	height: 350px;
	margin-bottom: 75px;
	:deep(.el-form) {
		padding: 0;
	}
}
</style>
<style lang="scss"></style>
