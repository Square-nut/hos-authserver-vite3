import { v4 as uuidv4 } from 'uuid';

export const timestamp = 'biz.timestamp';
export const uid = 'biz.uid';
export const event = 'biz.event';
export const params = 'biz.params';

export function common(
	state: Record<string, unknown>,
	_params: Record<string, unknown> & { _uid?: unknown },
) {
	let _uid: unknown = 0;
	if (_params && _params._uid !== undefined) {
		_uid = _params._uid;
		delete _params._uid;
	}

	state[timestamp] = uuidv4();
	state[uid] = _uid;
	state[params] = _params;
}

export function commonTable(
	state: Record<string, unknown>,
	_params: Record<string, unknown> & { _uid?: unknown },
) {
	let _uid: unknown = 0;
	if (_params && _params._uid !== undefined) {
		_uid = _params._uid;
		delete _params._uid;
	}

	state[timestamp] = uuidv4();
	state[uid] = _uid;
	const bag = state[params] as Record<string, unknown>;
	bag[_uid as string | number] = _params;
}
