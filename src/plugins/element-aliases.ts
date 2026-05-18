import type { App, Component, Plugin } from 'vue';
import {
	ElButton,
	ElForm,
	ElPagination,
	ElPopover,
	ElSelect,
} from 'element-plus';

/** 兼容历史模板/代码中的 l-* 组件名（原 hosui 别名） */
const elementAliases: Plugin = {
	install(app: App) {
		const pairs: [string, Component][] = [
			['LButton', ElButton],
			['l-button', ElButton],
			['LForm', ElForm],
			['l-form', ElForm],
			['LPagination', ElPagination],
			['l-pagination', ElPagination],
			['LPopover', ElPopover],
			['l-popover', ElPopover],
			['LSelect', ElSelect],
			['l-select', ElSelect],
		];
		pairs.forEach(([name, component]) => {
			app.component(name, component);
		});
	},
};

export default elementAliases;
