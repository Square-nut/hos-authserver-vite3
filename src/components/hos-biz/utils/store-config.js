import { v4 as uuidv4 } from 'uuid';
export const timestamp = 'biz.timestamp'
export const uid = 'biz.uid'
export const event = 'biz.event'
export const params = 'biz.params'

export function common(state, _params) {
  let _uid = 0
  if (_params && _params._uid) {
    _uid = _params._uid
    delete _params._uid
  }
 
  state[timestamp] = uuidv4();
  state[uid] = _uid
  state[params] = _params
}

// 将dialog和table的common方法进行区分,避免互相影响.
// commonTable方法将commit传入的_params放在对应的uid下面.
export function commonTable(state, _params) {
  let _uid = 0
  if (_params && _params._uid) {
    _uid = _params._uid
    delete _params._uid
  }
 
  state[timestamp] = uuidv4();
  state[uid] = _uid
  state[params][_uid] = _params // 将传入的_params放在对应的uid下面.
}