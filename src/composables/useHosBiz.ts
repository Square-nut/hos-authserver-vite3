/**
 * Hos-biz orchestration: dialogs and tables over Pinia (no Vuex shim).
 * Safe to call from `<script setup>` and Options API `methods`.
 */
import { useHosBizDialogStore } from '@/stores/hosBizDialog';
import { useHosBizTableStore } from '@/stores/hosBizTable';
import { useLoginSessionStore } from '@/stores/loginSession';
import { useUserStore } from '@/stores/user';

export function openHosBizDialog(payload: Record<string, unknown>) {
	useHosBizDialogStore().OPEN_DIALOG(payload);
}

export function closeHosBizDialog(payload?: Record<string, unknown>) {
	useHosBizDialogStore().CLOSE_DIALOG(payload ?? {});
}

export function updateHosBizTable(payload: Record<string, unknown>) {
	useHosBizTableStore().UPDATE_TABLE(payload);
}

export function refreshHosBizTable(payload: Record<string, unknown>) {
	useHosBizTableStore().REFRESH_TABLE(payload);
}

export function reloadHosBizTable(payload: Record<string, unknown>) {
	useHosBizTableStore().RELOAD_TABLE(payload);
}

export function setLoginI18nList(data: unknown[]) {
	useLoginSessionStore().SET_I18N_LIST(data);
}

export function setLoginPostVersion(version: string) {
	useLoginSessionStore().SET_LOGIN_POST_VERSION(version);
}

export function setLoginPortalUrl(url: string) {
	useLoginSessionStore().SET_PORTAL_URL(url);
}

export function setLoginAuthInfo(data: Record<string, unknown>) {
	useLoginSessionStore().SET_AUTH_INFO(data);
}

export function setLoginPageStyle(config: Record<string, unknown>) {
	useUserStore().setLoginStyle(config);
}

/** Composition wrapper when you prefer destructuring in `<script setup>`. */
export function useHosBiz() {
	return {
		openDialog: openHosBizDialog,
		closeDialog: closeHosBizDialog,
		updateTable: updateHosBizTable,
		refreshTable: refreshHosBizTable,
		reloadTable: reloadHosBizTable,
		setLoginI18nList,
		setLoginPostVersion,
		setLoginPortalUrl,
		setLoginAuthInfo,
		setLoginPageStyle,
	};
}
