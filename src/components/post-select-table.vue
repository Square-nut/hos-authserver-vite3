<template>
	<div class="post-select-table">
		<el-biz-select-table-2
			ref="tableWrapperRef"
			v-model="postValue"
			v-bind="$attrs"
			:disabled="props.disabled"
			:uid="tableUid"
			page-pos="bottom"
			header-row-class-name="login-biz-table-header"
			tooltip-effect="select-table-tooltip"
			height="200px"
			:dropdown-width="545"
			:cols="cols"
			:value-config="valueConfig"
			:form="form"
			:table-data="selectPostPage"
			:init="false"
			:stripe="false"
			:border="false"
			:page="pageConfig"
			:row-disabled-method="rowDisabledMethod"
			@after-load="tableLoadAfter"
			@change="changePeople"
		>
			<template #form>
				<el-row :gutter="20">
					<el-col :span="11">
						<el-form-item :label="t('业务单元')" label-width="80px">
							<el-input
								v-model="form.model.queryBuName"
								:placeholder="t('业务单元')"
								clearable
								@input="searchPost"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="11">
						<el-form-item :label="t('业务岗位')" label-width="80px">
							<el-input
								v-model="form.model.queryPostName"
								:placeholder="t('业务岗位')"
								clearable
								@input="searchPost"
							/>
						</el-form-item>
					</el-col>
				</el-row>
			</template>
		</el-biz-select-table-2>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	fetchSelectPostPage,
	type PostPageRecord,
} from '@/api/org';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<{
		type?: string;
		personId?: string;
		uid?: string;
		disabled?: boolean;
	}>(),
	{
		type: '',
		personId: '',
		uid: 'post',
		disabled: false,
	},
);

const emit = defineEmits<{
	change: [value: string | number, post: PostPageRecord | undefined];
}>();

const postValue = defineModel<string | number>({ default: '' });

const { t } = useI18n();

const tableUid = computed(() => `${props.uid}-Table`);
type SelectTableExpose = {
	refresh?: () => void;
	fitHeight?: (height: number) => void;
};

const tableWrapperRef = ref<SelectTableExpose | null>(null);

const pageConfig = reactive<{
	pageSize: number;
	layout?: string;
}>({
	pageSize: 5,
});

const form = reactive({
	labelWidth: 'auto',
	labelPosition: 'left',
	model: {
		queryBuName: '',
		queryPostName: '',
	},
});

const postList = ref<PostPageRecord[]>([]);

const cols = computed(() => [
	{ label: t('业务单元'), prop: 'buName' },
	{ label: t('业务岗位'), prop: 'postName' },
]);

const valueConfig = {
	label: 'name',
	value: 'id',
};

function selectPostPage(params: Record<string, unknown>) {
	return fetchSelectPostPage({
		...params,
		type: props.type,
		personId: props.personId,
	});
}

function tableLoadAfter(data: PostPageRecord[]) {
	if (Array.isArray(data) && data.length) {
		postList.value = data;
		if (postValue.value === '' || postValue.value == null) {
			const first = data[0];
			if (first) {
				postValue.value = first.id;
				emit('change', postValue.value, first);
			}
		}
	} else {
		clear();
	}
}

function searchPost() {
	tableWrapperRef.value?.refresh?.();
}

function rowDisabledMethod(row: PostPageRecord) {
	return row.activity === false;
}

function changePeople(val: string | number) {
	const post = postList.value.find((ele) => ele.id == val);
	emit('change', val, post);
}

function refresh() {
	tableWrapperRef.value?.refresh?.();
}

function clear() {
	postList.value = [];
	postValue.value = '';
}

defineExpose({ refresh, clear });

onMounted(() => {
	if (import.meta.env.VITE_APP_THEME_STYLE === '1') {
		pageConfig.layout = 'total, home, prev, pager, next, end';
	}
	nextTick(() => {
		tableWrapperRef.value?.fitHeight?.(200);
	});
});
</script>

<style lang="scss" scoped></style>
<style lang="scss">
.post-select-table .el-select__prefix {
	left: 0;
	right: auto;
}
</style>
