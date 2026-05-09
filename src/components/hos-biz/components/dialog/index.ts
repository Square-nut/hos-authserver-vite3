/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 10:58:36
 * @Last Modified by: liruiqing@mediway.cn
 * @Last Modified time: 2026-05-09 12:06:26
 */
import type { Component } from 'vue';
import { defineComponent, h } from 'vue';
import { ElDialog } from 'element-plus';
import { useHosBizDialogStore } from '@/stores/hosBizDialog';
import type { DialogUid } from '@/stores/hosBizDialog';
import { event as bizEventKey, uid } from '../../utils/store-config';

export default defineComponent({
	name: 'HosBizDialog',
	inheritAttrs: false,
	props: {
		uid: {
			type: [String, Number],
			default: 0,
		},
	},
	emits: ['close'],
	data(): {
		visible: boolean;
		unsubscribe: (() => void) | null;
	} {
		return {
			visible: false,
			unsubscribe: null,
		};
	},
	created() {
		const store = useHosBizDialogStore();
		this.unsubscribe = store.$subscribe(() => {
			const sUID = store[uid];
			const sEvent = store[bizEventKey] as string;
			if (sUID === 'all' || sUID === 0 || sUID === this.uid) {
				this.visible = sEvent === 'open';
			}
			document
				.querySelectorAll('.el-dialog__wrapper')
				.forEach((ele) => ele.removeAttribute('title'));
		});
	},
	beforeUnmount() {
		this.unsubscribe?.();
	},
	render() {
		const dialogStore = useHosBizDialogStore();
		const entry = dialogStore.getDialogComponents(this.uid as DialogUid);
		const Inner =
			this.visible && entry?.component
				? h(entry.component as Component, entry.props ?? {})
				: null;

		return h(
			ElDialog,
			{
				...this.$attrs,
				modelValue: this.visible,
				destroyOnClose: true,
				appendToBody: true,
				onClose: () => {
					dialogStore.CLOSE_DIALOG({ _uid: this.uid as DialogUid });
					this.$emit('close');
				},
				'onUpdate:modelValue': (v: boolean) => {
					this.visible = v;
				},
			},
			{
				default: () => (Inner ? [Inner] : []),
			},
		);
	},
});
