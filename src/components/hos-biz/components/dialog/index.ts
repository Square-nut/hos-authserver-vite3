/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 10:58:36
 */
import { h, defineComponent, type VNode, type Component } from 'vue';
import { ElDialog } from '../../utils/element-plus-resolve';
import { useHosBizDialogStore, subscribeHosBizDialogMutations } from '@/stores/hosBizDialog';
import { dialogStoreComputed, hosBizUidMatches } from '../../utils/pinia-bridge';

const props = {
	uid: {
		type: [String, Number],
		default: 0,
	},
};

function dialogUidMatches(storeUid: unknown, instanceUid: unknown) {
	if (storeUid === 'all' || storeUid === 0) return true;
	return hosBizUidMatches(storeUid, instanceUid);
}

type DialogInstance = {
	uid: string | number;
	sUID: unknown;
	sEvent: string;
	visible: boolean;
	$attrs: Record<string, unknown>;
	$emit: (event: 'close', val?: unknown) => void;
	unsubscribe: (() => void) | null;
};

const HosBizDialog = defineComponent({
	name: 'HosBizDialog',
	props,
	computed: dialogStoreComputed(),
	created(this: DialogInstance) {
		this.unsubscribe = subscribeHosBizDialogMutations(() => {
			if (dialogUidMatches(this.sUID, this.uid)) {
				this.visible = this.sEvent === 'open';
			}
			document.querySelectorAll('.el-overlay').forEach((ele) => {
				ele.removeAttribute('title');
			});
		});
	},
	beforeUnmount(this: DialogInstance) {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	},
	data() {
		return {
			visible: false,
			unsubscribe: null as (() => void) | null,
		};
	},
	render(this: DialogInstance) {
		const dialogStore = useHosBizDialogStore();
		const dialogComponent = dialogStore.getDialogComponents(this.uid);
		const attrs = { ...this.$attrs };
		const children: VNode[] =
			this.visible && dialogComponent?.component
				? [
						h(
							dialogComponent.component as Component,
							dialogComponent.props || {},
						),
					]
				: [];

		return h(
			ElDialog,
			{
				...attrs,
				modelValue: this.visible,
				'onUpdate:modelValue': (val: boolean) => {
					this.visible = val;
					if (!val) {
						dialogStore.CLOSE_DIALOG({ _uid: this.uid });
					}
				},
				destroyOnClose: true,
				appendToBody: true,
				onClose: (...args: unknown[]) => {
					dialogStore.CLOSE_DIALOG({ _uid: this.uid });
					this.$emit('close', args[0]);
				},
			},
			{
				default: () => children,
			},
		);
	},
});

export default HosBizDialog as Component;
