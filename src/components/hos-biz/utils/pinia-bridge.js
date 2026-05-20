import { mapStores } from 'pinia';
import { useHosBizDialogStore } from '@/stores/hosBizDialog';
import { useHosBizTableStore } from '@/stores/hosBizTable';
import { timestamp, uid, event, params } from './store-config';

/** Options API：替代 vuex mapState('dialog'|'table') */
export const mapHosBizDialogStore = mapStores(useHosBizDialogStore);

export const mapHosBizTableStore = mapStores(useHosBizTableStore);

export function dialogStoreComputed() {
	return {
		...mapHosBizDialogStore,
		sTimestamp() {
			return this.hosBizDialogStore[timestamp];
		},
		sUID() {
			return this.hosBizDialogStore[uid];
		},
		sEvent() {
			return this.hosBizDialogStore[event];
		},
		sParams() {
			return this.hosBizDialogStore[params];
		},
	};
}

export function tableStoreComputed() {
	return {
		...mapHosBizTableStore,
		sTimestamp() {
			return this.hosBizTableStore[timestamp];
		},
		sUID() {
			return this.hosBizTableStore[uid];
		},
		sEvent() {
			return this.hosBizTableStore[event];
		},
		sParams() {
			return this.hosBizTableStore[params];
		},
	};
}
