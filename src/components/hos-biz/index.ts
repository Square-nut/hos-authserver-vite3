/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-21 18:57:24
 * @Last Modified time: 2026-05-09
 */
import type { App, Component, Plugin } from 'vue';
import STable from './components/l-biz-table.vue';
import SButton from './components/form/button';
import SDialog from './components/dialog';
import SelectTable2 from './components/select-table-v2/index.vue';

const components: Record<string, Component> = {
	STable,
	SButton,
	SDialog,
	SelectTable2,
};

const install: Plugin = (app: App) => {
	Object.values(components).forEach((component) => {
		const comp = component as Component & { name?: string };
		if (comp.name) {
			app.component(comp.name, component);
		}
	});
};

export default { install };
