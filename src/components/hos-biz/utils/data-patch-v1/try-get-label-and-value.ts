const DICT: { label: string; value: string }[] = [];

DICT.push({
	label: 'name',
	value: 'id',
});

DICT.push({
	label: 'name',
	value: 'code',
});

DICT.push({
	label: 'lable',
	value: 'value',
});

DICT.push({
	label: 'categoryName',
	value: 'id',
});

export default function tryGetLabelAndValue(
	data: unknown,
): { label: string; value: string } | null {
	if (!Array.isArray(data) || data.length === 0) return null;
	for (let i = 0, len = DICT.length; i < len; i++) {
		const { label, value } = DICT[i]!;
		if (
			data.every(
				(v) =>
					v &&
					typeof v === 'object' &&
					label in v &&
					value in (v as object),
			)
		) {
			return DICT[i]!;
		}
	}
	return null;
}
