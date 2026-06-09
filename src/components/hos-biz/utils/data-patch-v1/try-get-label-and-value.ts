/* eslint-disable */
/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-12 11:09:45
 */

interface LabelValueDict {
	label: string;
	value: string;
}

// 没有规范时的临时替代方案,存在读取错误可能性
const DICT: LabelValueDict[] = [];

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

export default (data: unknown): LabelValueDict | null => {
	if (!Array.isArray(data) || data.length === 0) return null;
	for (let i = 0, len = DICT.length; i < len; i++) {
		const { label, value } = DICT[i]!;
		if (data.every((v) => Object.prototype.hasOwnProperty.call(v, label) && Object.prototype.hasOwnProperty.call(v, value))) {
			return DICT[i]!;
		}
	}
	return null;
};
/* eslint-disable */
