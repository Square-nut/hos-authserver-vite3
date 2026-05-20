/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-21 18:57:24
 */
import STable from './components/hos-biz-table.vue';
import SButton from './components/form/button';
import SDialog from './components/dialog';
import SelectTable2 from './components/select-table-v2/index.vue';

const components = {
	STable,
	SButton,
	SDialog,
	SelectTable2,
};

/** 登录页等模板使用的 el-biz-* 名称 */
const EL_BIZ_ALIASES = {
	'el-biz-table': STable,
	'el-biz-button': SButton,
	'el-biz-dialog': SDialog,
	'el-biz-select-table-2': SelectTable2,
	'hos-biz-table': STable,
};

const install = (app) => {
	Object.values(components).forEach((component) => {
		if (component?.name) {
			app.component(component.name, component);
		}
	});
	Object.entries(EL_BIZ_ALIASES).forEach(([name, component]) => {
		app.component(name, component);
	});
};

export default { install };
