/*
 * @Author: liruiqing@mediway.cn
 * @Date: 2022-03-21 18:57:24
 * @Last Modified by: liruiqing@mediway.cn
 * @Last Modified time: 2024-04-23 09:22:40
 */
import STable from './components/l-biz-table.vue';
import SButton from './components/form/button';
import SDialog from './components/dialog';
import SelectTable2 from './components/select-table-v2/index.vue';
const components = {
	STable,
	SButton,
	SDialog,
	SelectTable2,
};
const install = (Vue) => {
	Object.keys(components).forEach((name) => {
		const component = components[name];
		Vue.component(component.name, component);
	});
};

export default { install };
