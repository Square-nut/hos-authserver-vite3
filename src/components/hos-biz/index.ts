/*
 * Element Plus 业务组件封装（el-biz-*）
 * 保留 HosBiz* 名称作为兼容别名
 */
import type { App, Component, Plugin } from 'vue';
import ElBizTable from './components/hos-biz-table.vue';
import ElBizButton from './components/form/button';
import ElBizDialog from './components/dialog';
import ElBizForm from './components/form';
import ElBizSelectTable2 from './components/select-table-v2/index.vue';

const components: Component[] = [
	ElBizTable,
	ElBizButton,
	ElBizDialog,
	ElBizForm,
	ElBizSelectTable2,
];

/** 主名称 ElBiz*，兼容旧 HosBiz* / hos-biz-* 模板 */
const legacyAliases: Record<string, string[]> = {
	ElBizTable: ['HosBizTable'],
	ElBizButton: ['HosBizButton'],
	ElBizDialog: ['HosBizDialog'],
	ElBizForm: ['HosBizForm'],
	ElBizSelectTable2: ['HosBizSelectTable2'],
};

const install: Plugin = (app: App) => {
	components.forEach((component) => {
		const comp = component as Component & { name?: string };
		if (!comp.name) return;
		app.component(comp.name, component);
		(legacyAliases[comp.name] || []).forEach((alias) => {
			app.component(alias, component);
		});
	});
};

export default { install };

export {
	ElBizTable,
	ElBizButton,
	ElBizDialog,
	ElBizForm,
	ElBizSelectTable2,
};
