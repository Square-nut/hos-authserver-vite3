import { mapStores } from 'pinia';
import { useHosBizDialogStore } from '@/stores/hosBizDialog';
import { useHosBizTableStore } from '@/stores/hosBizTable';
import { timestamp, uid, event, params } from './store-config';

/** Options API：替代 vuex mapState('dialog'|'table') */
export const mapHosBizDialogStore = mapStores(useHosBizDialogStore);

export const mapHosBizTableStore = mapStores(useHosBizTableStore);

type StoreComputedHost = {
	hosBizDialogStore: ReturnType<typeof useHosBizDialogStore>;
	hosBizTableStore: ReturnType<typeof useHosBizTableStore>;
};

export function dialogStoreComputed() {
	return {
		...mapHosBizDialogStore,
		sTimestamp(this: StoreComputedHost) {
			return this.hosBizDialogStore[timestamp];
		},
		sUID(this: StoreComputedHost) {
			return this.hosBizDialogStore[uid];
		},
		sEvent(this: StoreComputedHost) {
			return this.hosBizDialogStore[event];
		},
		sParams(this: StoreComputedHost) {
			return this.hosBizDialogStore[params];
		},
	};
}

/** Pinia 广播 uid 与组件 :uid 对齐（兼容 string/number） */
export function hosBizUidMatches(storeUid: unknown, instanceUid: unknown): boolean {
	if (storeUid === 'all') return true;
	return String(storeUid) === String(instanceUid);
}

export function tableStoreComputed() {
	return {
		...mapHosBizTableStore,
		sTimestamp(this: StoreComputedHost) {
			return this.hosBizTableStore[timestamp];
		},
		sUID(this: StoreComputedHost) {
			return this.hosBizTableStore[uid];
		},
		sEvent(this: StoreComputedHost) {
			return this.hosBizTableStore[event];
		},
		sParams(this: StoreComputedHost) {
			return this.hosBizTableStore[params];
		},
	};
}
