/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-21 14:29:48
 * @Last Modified by: liruiqing@mediway.cn
 * @Last Modified time: 2022-04-02 17:08:29
 */
import { timestamp, uid, event, params, common } from "../utils/store-config";
import { CLOSE_DIALOG, OPEN_DIALOG } from "./mutation-types";
const components = {};

const state = {
  [timestamp]: +new Date(),
  [uid]: 0,
  [event]: "open",
  [params]: undefined
};

const getters = {
  getDialogComponents: state => uid => {
    return components[uid];
  }
};

const mutations = {
  [OPEN_DIALOG](state, _params) {
    // 缓存组件
    let uid = (_params && _params._uid) || 0;
    components[uid] = {
      component: _params.component,
      props: _params.props
    };
    common(state, _params);
    state[event] = "open";
  },
  [CLOSE_DIALOG](state, _params) {
    // 清除组件缓存
    let uid = (_params && _params._uid) || 0;
    components[uid] = {
      component: null,
      props: null
    };
    common(state, _params);
    state[event] = "close";
  }
};

export default {
  state,
  mutations,
  getters
};
