import { timestamp, uid, event, params, commonTable } from "../utils/store-config";
import { UPDATE_TABLE, RELOAD_TABLE, REFRESH_TABLE } from "./mutation-types";
const state = {
  [timestamp]: +new Date(),
  [uid]: 0,
  [event]: "update",
  [params]: {}
};

const mutations = {
  ['CLEAR_PARAMS'] () {
    state[params] = {}
  },
  [UPDATE_TABLE](state, _params) {
    commonTable(state, _params);
    state[event] = "update";
  },
  [REFRESH_TABLE](state, _params) {
    commonTable(state, _params);
    state[event] = "refresh";
  },
  [RELOAD_TABLE](state, _params) {
    commonTable(state, _params);
    state[event] = "doLayout";
  }
};

export default {
  state,
  mutations
};
