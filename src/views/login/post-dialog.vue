<template>
	<div class="pl15 pr15 pt15 login-post-dialog">
		<el-biz-table
			ref="postDialogSelectTableRef"
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
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { closeHosBizDialog, updateHosBizTable } from '@/composables/useHosBiz';
import { fetchSelectPostPage } from '@/api/org';

const { t } = useI18n();

const props = defineProps<{
	postData?: Record<string, unknown>;
	personId?: string;
	postChainId?: string;
	name?: string;
	openTwoAuthDialog?: (
		grantChainId: string,
		authType: string,
		account: string,
		caData: unknown,
		phone: string
	) => void;
	loginSucessHandler?: () => void;
	dialogUid?: string;
	handleRowClick?: (post: unknown) => void;
}>();

const postDialogSelectTableRef = ref<{
	setCurrentRow: (row: unknown) => void;
} | null>(null);

const disabled = ref(true);
const pageConfig = reactive<Record<string, unknown>>({
	pageSize: 5,
});
const post = ref<Record<string, unknown> | ''>('');
const form = reactive({
	labelWidth: 'auto',
	labelPosition: 'left',
	model: {
		query: '',
		dataType: '',
		queryBuName: '',
		queryPostName: '',
	},
});
const cols = [
	{
		label: t('业务单元'),
		prop: 'buName',
	},
	{
		label: t('业务岗位'),
		prop: 'postName',
	},
];
const valueConfig = {
	label: 'name',
	value: 'id',
};
const options = [
	{
		label: t('岗位单元'),
		value: 'unit',
	},
	{
		label: t('岗位组'),
		value: 'group',
	},
	{
		label: t('岗位'),
		value: 'post',
	},
];
const loading = ref(false);
const loginForm = reactive<Record<string, unknown>>({});

onMounted(() => {
	if (import.meta.env.VITE_APP_THEME_STYLE == '1') {
		pageConfig.layout = 'total, home, prev, pager, next, end';
	}
	if (props.dialogUid) {
		// this.$refs['post-dialog-select-table'].setCurrentRow(row);
		// this.handleRowClick(this.post)
	}
});

function onRowDblclick(row: Record<string, unknown>) {
	post.value = row;
	loading.value = true;
	disabled.value = true;
	loginFn();
}

function save() {
	if (props.dialogUid) {
		props.handleRowClick?.(post.value);
	} else {
		loginFn();
	}
}

function cancel() {
	if (props.dialogUid) {
		closeHosBizDialog({
			_uid: 'dropmenu-post-change-dialog',
		});
	} else {
		closeHosBizDialog({ _uid: 'postDialog' });
	}
}

function loginFn() {
	const postData = JSON.parse(JSON.stringify(props.postData ?? {}));
	postData.postChainId = props.postChainId;
	postData.post = post.value;
	if (!post.value) {
		ElMessage.error(t('请选择岗位单元！'));
		return;
	}
	loading.value = true;
	disabled.value = true;
	useUserStore()
		.Login(postData)
		.then((res) => {
			loading.value = false;
			if (res && res.code == 200) {
				if (res.data.againAuthType) {
					const grantChainId = res.data.grantChainId;
					const authType = res.data.againAuthType;
					const account = res.data.accountCode;
					const caData = res.data.caData;
					const phone = res.data.phone;
					props.openTwoAuthDialog?.(
						grantChainId,
						authType,
						account,
						caData,
						phone
					);
				} else {
					props.loginSucessHandler?.();
				}
			}
		})
		.catch((err: { code?: string; msg?: string }) => {
			loading.value = false;
			if (!err.code?.includes('101-002-005-')) {
				ElMessage.error(err.msg);
			}
		});
}

function selectPostPage(params: Record<string, unknown>) {
	params.type = 'id';
	params.personId = props.personId;
	params.size = 5;
	return fetchSelectPostPage(params);
}

function rowDisabledMethod(row: { activity?: boolean }) {
	return row.activity === false;
}

function changePeople(row: Record<string, unknown>) {
	post.value = row;
	disabled.value = false;
}

function reset() {
	form.model = {
		query: '',
		dataType: '',
		queryBuName: '',
		queryPostName: '',
	};
	post.value = '';
	disabled.value = true;
	updateHosBizTable({ _uid: 'post-dialog-select-table' });
}

function tableLoadAfter(data: unknown[]) {
	if (Array.isArray(data) && data.length) {
		postDialogSelectTableRef.value?.setCurrentRow(data[0]);
	}
}
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
