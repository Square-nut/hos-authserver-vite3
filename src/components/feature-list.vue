<template>
	<div class="simple-login-feature">
		<div
			class="feature-item"
			v-for="(feat, index) in list"
			:key="'feat-' + index"
		>
			<template v-for="(item, ind) in feat" :key="'feat-item-' + ind">
				<div
					v-if="item.type == 'Title' && item.actived == true"
					class="feature-item-header"
				>
					<img
						:src="item.content?.login_back_file_id"
						alt=""
						class="dib mid"
					/>
					<span class="dib mid">{{ item.title }}</span>
				</div>
				<p
					v-if="item.type == 'Desc' && item.actived == true"
					class="feature-item-body"
				>
					{{ item.content }}
				</p>
				<img
					v-if="item.type == 'Icon' && item.actived == true"
					class="feature-single-img"
					alt=""
					:src="item.content?.login_back_file_id"
				/>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
	data: {
		type: Array,
		default: () => [],
	},
});

const list = computed(() =>
	Array.isArray(props.data) ? props.data.filter(Array.isArray) : [],
);
</script>

<style lang="scss" scoped></style>
