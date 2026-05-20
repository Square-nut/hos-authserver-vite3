/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 10:58:36
 */
import { h } from 'vue';
import { useHosBizDialogStore, subscribeHosBizDialogMutations } from '@/stores/hosBizDialog';
import { dialogStoreComputed } from '../../utils/pinia-bridge';

const props = {
	uid: {
		default: 0,
	},
};

export default {
	name: 'HosBizDialog',
	props,
	computed: dialogStoreComputed(),
	created() {
		this.unsubscribe = subscribeHosBizDialogMutations(() => {
			if (
				this.sUID === 'all' ||
				this.sUID === 0 ||
				this.sUID === this.uid
			) {
				this.visible = this.sEvent === 'open';
			}
			const wrappers = document.querySelectorAll(
				'.hos-dialog__wrapper, .el-overlay',
			);
			wrappers.forEach((ele) => ele.removeAttribute('title'));
		});
	},
	beforeUnmount() {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	},
	data() {
		return {
			visible: false,
			unsubscribe: null,
		};
	},
	render() {
		const dialogStore = useHosBizDialogStore();
		const dialogComponent = dialogStore.getDialogComponents(this.uid);
		const attrs = { ...this.$attrs };
		const children =
			this.visible && dialogComponent?.component
				? [
						h(
							dialogComponent.component,
							dialogComponent.props || {},
						),
					]
				: [];

		return h(
			'hos-dialog',
			{
				...attrs,
				modelValue: this.visible,
				'onUpdate:modelValue': (val) => {
					this.visible = val;
				},
				destroyOnClose: true,
				appendToBody: true,
				onClose: (val) => {
					dialogStore.CLOSE_DIALOG({ _uid: this.uid });
					this.$emit('close', val);
				},
			},
			() => children,
		);
	},
};
