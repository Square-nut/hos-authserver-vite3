/*
 * Pinia equivalent of src/components/hos-biz/store/dialog.js (Vuex module).
 */
import { defineStore } from 'pinia';
import {
	common,
	event,
	params,
	timestamp,
	uid,
} from '../components/hos-biz/utils/store-config';

export type DialogUid = number | string;

export type DialogComponentEntry = {
	component: unknown;
	props: Record<string, unknown> | null;
};

const dialogComponents: Record<string, DialogComponentEntry> = {};

export type HosBizDialogMutationType = 'OPEN_DIALOG' | 'CLOSE_DIALOG';

type HosBizDialogMutationListener = (
	type: HosBizDialogMutationType,
	payload: Record<string, unknown>,
) => void;

const hosBizDialogMutationListeners = new Set<HosBizDialogMutationListener>();

export function subscribeHosBizDialogMutations(
	listener: HosBizDialogMutationListener,
) {
	hosBizDialogMutationListeners.add(listener);
	return () => {
		hosBizDialogMutationListeners.delete(listener);
	};
}

function emitHosBizDialogMutation(
	type: HosBizDialogMutationType,
	payload: Record<string, unknown>,
) {
	hosBizDialogMutationListeners.forEach((fn) => fn(type, payload));
}

export const useHosBizDialogStore = defineStore('hosBizDialog', {
	state: () => ({
		[timestamp]: Date.now(),
		[uid]: 0 as DialogUid,
		[event]: 'open',
		[params]: undefined as unknown,
	}),
	getters: {
		getDialogComponents(): (uidVal: DialogUid) => DialogComponentEntry | undefined {
			return (uidVal: DialogUid) => dialogComponents[String(uidVal)];
		},
	},
	actions: {
		OPEN_DIALOG(payload: Record<string, unknown> & { _uid?: DialogUid }) {
			const _params = { ...payload };
			const id = (_params && _params._uid) ?? 0;
			const key = String(id);
			dialogComponents[key] = {
				component: _params.component,
				props: (_params.props as Record<string, unknown> | null) ?? null,
			};
			common(this.$state as unknown as Record<string, unknown>, _params);
			this[event] = 'open';
			emitHosBizDialogMutation('OPEN_DIALOG', { ..._params });
		},
		CLOSE_DIALOG(payload: Record<string, unknown> & { _uid?: DialogUid }) {
			const _params = { ...payload };
			const id = (_params && _params._uid) ?? 0;
			const key = String(id);
			dialogComponents[key] = {
				component: null,
				props: null,
			};
			common(this.$state as unknown as Record<string, unknown>, _params);
			this[event] = 'close';
			emitHosBizDialogMutation('CLOSE_DIALOG', { ..._params });
		},
	},
});
