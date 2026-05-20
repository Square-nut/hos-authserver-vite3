import type { App, Component } from 'vue';
import {
	ElButton,
	ElCheckbox,
	ElDialog,
	ElForm,
	ElPagination,
	ElPopover,
	ElRadio,
	ElSelect,
	ElTable,
	ElTableColumn,
} from 'element-plus';

/** hosui 组件名 → Element Plus（供 hos-biz render / 遗留模板使用） */
const HOS_ELEMENT_ALIASES: [string, Component][] = [
	['hos-button', ElButton],
	['hos-dialog', ElDialog],
	['hos-form', ElForm],
	['hos-table', ElTable],
	['hos-table-column', ElTableColumn],
	['hos-pagination', ElPagination],
	['hos-radio', ElRadio],
	['hos-checkbox', ElCheckbox],
	['hos-popover', ElPopover],
	['hos-select', ElSelect],
];

export function registerHosElementAliases(app: App) {
	HOS_ELEMENT_ALIASES.forEach(([name, component]) => {
		app.component(name, component);
	});
}
