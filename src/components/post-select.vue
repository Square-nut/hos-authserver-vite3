<template>
	<div class="post-select">
		<el-select
			v-model="post"
			v-bind="$attrs"
			popper-class="post-select-popper"
			@change="change"
		>
			<template #prefix>
				<el-icon v-if="isHosTheme"><Briefcase /></el-icon>
				<img v-else src="@/assets/images/login/z61.png" alt="" />
			</template>
			<el-option
				v-for="item in postList"
				:key="item.id"
				:label="item.name"
				:value="item.id"
			/>
		</el-select>
	</div>
</template>

<script setup lang="ts">
import { Briefcase } from '@element-plus/icons-vue';
import { ref } from 'vue';
import { fetchSelectPostPage, type PostPageRecord } from '@/api/org';

const props = defineProps<{
	type?: string;
	personId?: string;
}>();

const emit = defineEmits<{
	change: [id: string, post: PostPageRecord];
}>();

const isHosTheme = String(import.meta.env.VITE_APP_THEME_STYLE) === '1';
const postList = ref<PostPageRecord[]>([]);
const post = ref('');

function getPostPage() {
	clear();
	const params = {
		current: 1,
		type: props.type,
		personId: props.personId,
		size: 9999,
	};
	fetchSelectPostPage(params)
		.then((res) => {
			const records = res.data?.records;
			if (res.code == 200 && records?.length) {
				postList.value = records;
				const first = postList.value[0];
				if (!first) return;
				post.value = first.id;
				emit('change', post.value, first);
			} else {
				clear();
			}
		})
		.catch(() => {
			clear();
		});
}

function change(val: string) {
	const row = postList.value.find((ele) => ele.id == val);
	if (row) {
		emit('change', val, row);
	}
}

function clear() {
	postList.value = [];
	post.value = '';
}

defineExpose({ getPostPage, clear });
</script>
