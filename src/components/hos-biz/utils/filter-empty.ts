export default function filterEmpty<T extends Record<string, unknown>>(params: T | null | undefined): T {
	if (!params) return {} as T;
	const _params = JSON.parse(JSON.stringify(params)) as T;
	for (const i in _params) {
		if (_params[i] === '') {
			delete _params[i];
		}
	}
	return _params;
}
