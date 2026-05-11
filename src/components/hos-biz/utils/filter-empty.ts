export default function filterEmpty(
	params: unknown,
): Record<string, unknown> {
	if (!params) return {};
	const _params = JSON.parse(JSON.stringify(params)) as Record<string, unknown>;
	for (const i in _params) {
		if (_params[i] === '') {
			delete _params[i];
		}
	}
	return _params;
}
