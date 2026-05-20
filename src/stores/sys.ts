import { defineStore } from 'pinia'

export const useSysStore = defineStore('sys', {
  state: () => ({
    showDbdialog: false,
  }),
  actions: {
    SET_SHOW_DBDIALOG(status: boolean) {
      this.showDbdialog = status;
    },
  },
});