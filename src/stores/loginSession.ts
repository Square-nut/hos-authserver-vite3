/**
 * Holds login-page fields previously carried by the legacy Vuex `login` module.
 */
import { defineStore } from 'pinia';

export const useLoginSessionStore = defineStore('loginSession', {
	state: () => ({
		langOpts: [] as unknown[],
		loginPostVersion: '',
		portalUrl: '',
		authInfo: {} as Record<string, unknown>,
		i18nStatus: undefined as boolean | undefined,
	}),
	actions: {
		SET_I18N_LIST(data: unknown[]) {
			this.langOpts = Array.isArray(data) ? data : [];
		},
		SET_LOGIN_POST_VERSION(version: string) {
			this.loginPostVersion = version;
			try {
				sessionStorage.setItem('loginPostVersion', String(version));
			} catch (error) {
				// Keep runtime stable when browser storage is unavailable/blocked.
				console.warn('set loginPostVersion failed:', error);
			}
		},
		SET_PORTAL_URL(url: string) {
			this.portalUrl = url;
		},
		SET_AUTH_INFO(data: Record<string, unknown>) {
			this.authInfo = data ?? {};
		},
		SET_I18N_STATUS(flag: boolean) {
			this.i18nStatus = flag;
		},
	},
});
