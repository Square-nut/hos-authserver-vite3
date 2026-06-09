import { v4 as uuidv4 } from 'uuid';

export const timestamp = 'biz.timestamp';
export const uid = 'biz.uid';
export const event = 'biz.event';
export const params = 'biz.params';

export function common(
	state: Record<string, unknown>,
	_params: Record<string, unknown> & { _uid?: string | number },
) {
	let _uid: string | number = 0;
	if (_params && _params._uid !== undefined) {
		_uid = _params._uid;
		delete _params._uid;
	}

	state[timestamp] = uuidv4();
	state[uid] = _uid;
	state[params] = _params;
}

// 将dialog和table的common方法进行区分,避免互相影响.
// commonTable方法将commit传入的_params放在对应的uid下面.
export function commonTable(
	state: Record<string, unknown>,
	_params: Record<string, unknown> & { _uid?: string | number },
) {
	let _uid: string | number = 0;
	if (_params && _params._uid !== undefined) {
		_uid = _params._uid;
		delete _params._uid;
	}

	state[timestamp] = uuidv4();
	state[uid] = _uid;
	if (!state[params] || typeof state[params] !== 'object') {
		state[params] = {};
	}
	(state[params] as Record<string, unknown>)[String(_uid)] = _params;
}
