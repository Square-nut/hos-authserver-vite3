/*
 * Pinia equivalent of src/components/hos-biz/store/table.js (Vuex module).
 */
import { defineStore } from 'pinia';
import {
	commonTable,
	event,
	params,
	timestamp,
	uid,
} from '../components/hos-biz/utils/store-config';

/** HosBizTable listens for refresh/update without coupling to Vuex. */
export type HosBizTableMutationType = 'UPDATE_TABLE' | 'REFRESH_TABLE';

type HosBizTableMutationListener = (
	type: HosBizTableMutationType,
	payload: Record<string, unknown>,
) => void;

const hosBizTableMutationListeners = new Set<HosBizTableMutationListener>();

export function subscribeHosBizTableMutations(listener: HosBizTableMutationListener) {
	hosBizTableMutationListeners.add(listener);
	return () => {
		hosBizTableMutationListeners.delete(listener);
	};
}

function emitHosBizTableMutation(
	type: HosBizTableMutationType,
	payload: Record<string, unknown>,
) {
	hosBizTableMutationListeners.forEach((fn) => fn(type, payload));
}

export type TableUid = number | string;

export const useHosBizTableStore = defineStore('hosBizTable', {
	state: () => ({
		[timestamp]: Date.now(),
		[uid]: 0 as TableUid,
		[event]: 'update',
		[params]: {} as Record<string, unknown>,
	}),
	actions: {
		CLEAR_PARAMS() {
			this[params] = {};
		},
		UPDATE_TABLE(_params: Record<string, unknown> & { _uid?: TableUid }) {
			const p = { ..._params };
			commonTable(this.$state as unknown as Record<string, unknown>, p);
			this[event] = 'update';
			emitHosBizTableMutation('UPDATE_TABLE', { ..._params });
		},
		REFRESH_TABLE(_params: Record<string, unknown> & { _uid?: TableUid }) {
			const p = { ..._params };
			commonTable(this.$state as unknown as Record<string, unknown>, p);
			this[event] = 'refresh';
			emitHosBizTableMutation('REFRESH_TABLE', { ..._params });
		},
		RELOAD_TABLE(_params: Record<string, unknown> & { _uid?: TableUid }) {
			const p = { ..._params };
			commonTable(this.$state as unknown as Record<string, unknown>, p);
			this[event] = 'doLayout';
		},
	},
});
