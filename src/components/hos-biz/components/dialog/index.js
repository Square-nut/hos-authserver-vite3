/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 10:58:36
 */
import { h } from 'vue';
import { ElDialog } from '../../utils/element-plus-resolve';
import { useHosBizDialogStore, subscribeHosBizDialogMutations } from '@/stores/hosBizDialog';
import { dialogStoreComputed, hosBizUidMatches } from '../../utils/pinia-bridge';

const props = {
	uid: {
		default: 0,
	},
};

function dialogUidMatches(storeUid, instanceUid) {
	if (storeUid === 'all' || storeUid === 0) return true;
	return hosBizUidMatches(storeUid, instanceUid);
}

export default {
	name: 'HosBizDialog',
	props,
	computed: dialogStoreComputed(),
	created() {
		this.unsubscribe = subscribeHosBizDialogMutations(() => {
			if (dialogUidMatches(this.sUID, this.uid)) {
				this.visible = this.sEvent === 'open';
			}
			document.querySelectorAll('.el-overlay').forEach((ele) => {
				ele.removeAttribute('title');
			});
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
			ElDialog,
			{
				...attrs,
				modelValue: this.visible,
				'onUpdate:modelValue': (val) => {
					this.visible = val;
					if (!val) {
						dialogStore.CLOSE_DIALOG({ _uid: this.uid });
					}
				},
				destroyOnClose: true,
				appendToBody: true,
				onClose: (val) => {
					dialogStore.CLOSE_DIALOG({ _uid: this.uid });
					this.$emit('close', val);
				},
			},
			{
				default: () => children,
			},
		);
	},
};
