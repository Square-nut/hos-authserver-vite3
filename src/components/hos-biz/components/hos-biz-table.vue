<!-- /* 
  * @Author: liruiqing@mediway.cn 
  * @Date: 2022-03-12 10:56:42 
  * @Last Modified by: liruiqing@mediway.cn
  * @Last Modified time: 2024-08-29 16:13:36
*/ -->
<template>
	<div
		class="l-biz-table"
		:class="{
			flex: isFit,
			'pagination-pos-bottom': pagePos === 'bottom',
			chrome49,
		}"
	>
		<div
			:class="{ mb15: !showToolbar && uiStyle == 1, 'l-biz-form': $slots.form }"
			v-if="form"
		>
			<Form
				ref="form"
				v-bind="form"
				:query-cache="queryCache"
				@reset="reset"
				@search="search"
			>
				<slot name="form"></slot>
			</Form>
		</div>
		<slot name="top"></slot>
		<div class="l-biz-toolbar" v-if="showToolbar">
			<div class="l-biz-toolbar-left" v-if="$slots.toolbar">
				<slot name="toolbar"></slot>
			</div>
			<div
				v-if="pagePos === 'top' && page !== false"
				class="l-biz-toolbar-right l-biz-pagination"
			>
				<Page
					v-bind="pageConfig"
					:query-cache="queryCache"
					class="fr"
					@current-change="currentChange"
					@size-change="sizeChange"
					size="mini"
					:uid="uid"
					:total="total"
					ref="page"
				></Page>
			</div>
			<div class="top-toolbar-table-setting" v-if="columnSelected">
				<el-popover placement="bottom" width="100" trigger="click">
					<div class="top-toolbar-table-setting-content">
						<div
							v-for="(item, index) in cols"
							:key="index"
							class="top-toolbar-table-setting-item"
							:class="{ none: item.none }"
						>
							<el-checkbox
								v-model="selectedInFilteredColumn"
								:label="item.columnSelectedKey"
								@change="changeFilteredColumn"
							>
								{{ item.columnSelectedLabel }}
							</el-checkbox>
						</div>
					</div>
					<template #reference>
						<i class="l-icom-config"></i>
					</template>
				</el-popover>
			</div>
		</div>
		<!-- style="min-height: 200px;" 解决resize事件表格导致页面卡死问题 -->
		<Table
			v-bind="$attrs"
			v-loading="tableIsLoading"
			:uid="uid"
			:data="tableData"
			:asyncSlot="asyncSlot"
			:cols="selectedCols"
			:height="height"
			:ref="'el-table-' + uid"
			@sort-change="sortChange"
			@current-change="convertCurrentChange"
			:border="border"
			:stripe="stripe"
			style="min-height: 200px"
			:class="{
				'table--top': !$slots.toolbar || !showToolbar,
				'table--bottom': page === false || (page && pagePos !== 'bottom'),
			}"
		>
			<!-- 表格默认插槽 -->
			<slot></slot>
		</Table>
		<slot name="bottom"></slot>
		<div
			v-if="page !== false && pagePos === 'bottom'"
			class="el-biz-pagination clearfix"
		>
			<!-- <slot name="page"></slot> -->
			<Page
				class="simple-pagination"
				v-bind="pageConfig"
				@current-change="currentChange"
				@size-change="sizeChange"
				:query-cache="queryCache"
				:uid="uid"
				:total="total"
				ref="page"
				:prev-text="uiStyle == 0 ? $t('el.pagination.prev') : null"
				:next-text="uiStyle == 0 ? $t('el.pagination.next') : null"
			>
				<i class="l-icon-refresh btn-refresh" @click="refresh"></i>
			</Page>
		</div>
	</div>
</template>
<script>
import { otherMethods } from '../utils/table-methods';
import Table from './table';
import Page from './pagination';
import Form from './form';
import tryGetOnlyArray from '../utils/data-patch-v1/try-get-only-array';
import tryGetPaginationParams from '../utils/data-patch-v1/try-get-pagination-params';
import { mapState } from 'pinia';
import { useHosBizTableStore } from '@/stores/hosBizTable';
import { timestamp, uid, event, params } from '../utils/store-config';
import filterEmpty from '../utils/filter-empty';
import Sortable from 'sortablejs';
import RenderLabel from '../utils/render-label';
import { v4 as uuidv4 } from 'uuid';
import { deepClone, returnGlobalValue } from '@/utils/index';
import { subscribeHosBizTableMutations } from '@/stores/hosBizTable';
import { updateHosBizTable } from '@/composables/useHosBiz';

export default {
	name: 'HosBizTable',
	mixins: [otherMethods],
	watch: {
		page: {
			handler: function (val, oldVal) {
				if (val.currentPage != oldVal.currentPage) {
					this.params.pagination.current = val.currentPage;
				}
			},
			deep: true,
		},
		cols: function () {
			this.setFilteredColumn();
		},
	},
	provide() {
		return {
			TABLE_PROVIDE: this,
		};
	},
	components: { Table, Page, Form },
	computed: {
		...mapState(useHosBizTableStore, {
			sTimestamp: timestamp,
			sUID: uid,
			sEvent: event,
			sParams: params,
		}),
		formItems() {
			try {
				return Object.keys(this.form.model);
			} catch (e) {
				return [];
			}
		},
		asyncSlot() {
			const slotArr = ['form', 'page', 'top', 'bottom'];
			const _slot = {};
			const slots = this.$slots;
			if (!slots) return _slot;
			Object.keys(slots)
				.filter((ele) => !slotArr.includes(ele))
				.forEach((ele) => {
					_slot[ele] = slots[ele];
				});
			return _slot;
		},
		paginationShowPage() {
			return this.params.pagination.current;
		},
		pageConfig() {
			const simple = 'ssizes, home, prev, spager, next, end, slot, stotal';
			const hos = 'jumper, home, prev, pager, next, end, ssizes, total';
			const pure = 'stotal, ssizes, prev, pager, next, jumper';
			let config = {
				layout: this.uiStyle == 0 ? simple : this.uiStyle == 1 ? hos : pure,
				total: this.total,
				currentPage: this.params.pagination.current,
				pageSize: this.params.pagination.size,
				pagerCount: 5,
			};
			if (Object.prototype.toString.call(this.page) === '[object Object]') {
				config = { ...config, ...this.page };
			}
			if (this.autoPageSize) {
				let rowNum = this.getRowNum();
				if (rowNum) {
					config.pageSize = rowNum;
					if (config.pageSize && Array.isArray(config.pageSize)) {
						config.pageSize.unshift(rowNum);
					}
				}
			}
			return config;
		},
		selectedCols() {
			return this.cols.filter((ele) => ele.hidden !== true);
		},
		showToolbar() {
			return (
				(this.page !== false && this.pagePos === 'top') ||
				this.$slots.toolbar ||
				this.columnSelected
			);
		},
	},
	props: {
		border: {
			default: true,
		},
		stripe: {
			default: function () {
				return this.$theme != 2;
			},
		},
		uid: {
			// 须保证全局唯一.
			default: 0,
		},
		data: {
			required: true,
		},
		init: {
			default: true,
		},
		form: {
			type: [Object, Boolean],
			default: undefined,
		},
		page: {
			type: [Object, Boolean],
			default: undefined,
		},
		pageTotal: Number,
		pagePos: {
			default: 'bottom',
		},
		props: {
			default() {
				return {
					// 将biz-table默认取值从之前的"data"字段改为"records"字段
					data: 'records',
					total: 'total',
				};
			},
		},
		dragable: Boolean,
		columnSelected: Boolean,
		cols: {
			required: true,
			type: Array,
		},
		isFit: {
			type: Boolean,
			default: true,
		},
		queryCache: {
			type: Boolean,
			default: false,
		},
		autoPageSize: {
			type: Boolean,
			default: false,
		},
		tableHeight: {
			type: [Number, String],
			default: undefined,
		},
	},
	data() {
		const UI_STYLE = this.$theme;
		return {
			unsubscribe: null,
			chrome49: false, // 是否是低版本浏览器
			uiStyle: UI_STYLE, // 0:极简  1:hos
			selectedInFilteredColumn: [],
			renderLabel: new RenderLabel(),
			dragTableBody: null,
			params: {
				form: {},
				pagination: {},
			},
			tableData: [],
			tableIsLoading: false,
			total: undefined,
			height: undefined,
		};
	},
	methods: {
		isChrome49() {
			if (navigator.userAgent.includes('Chrome/49')) {
				this.chrome49 = true;
			}
		},
		setTableData(response) {
			const data = response.data || response;
			this.tableIsLoading = false;
			let tableData = data[this.props.data];
			let total = data[this.props.total];
			let parseTotal = parseInt(total);
			if (typeof parseTotal === 'number' && !Number.isNaN(parseTotal))
				total = parseTotal; // 处理当total为string时的情况
			if (!Array.isArray(tableData)) {
				tableData = tryGetOnlyArray(data).data;
			}
			if (typeof total !== 'number') {
				total = tryGetPaginationParams(data).total;
			}
			this.tableData = tableData;
			this.total = total;
		},
		parseData(params) {
			let _params = filterEmpty(params);
			if (typeof this.data === 'string') {
				this.tableIsLoading = true;
				/* eslint handle-callback-err: "warn" */
				return this.$api(this.data, _params)
					.then((response) => {
						if (response && response.code == '200') {
							this.setTableData(response);
						} else {
							this.total = 0;
							this.tableIsLoading = false;
							// this.$message.error(this.$t(response.code, response.msg));
						}
					})
					.catch((err) => {
						this.total = 0;
						this.tableIsLoading = false;
					})
					.finally(() => {
						this.$emit('after-load', this.tableData || []);
						this.$nextTick(() => {
							this.doLayout();
						});
					});
			} else if (typeof this.data === 'function') {
				this.tableIsLoading = true;
				return this.data(_params)
					.then((response) => {
						if (response?.code == '200') {
							this.setTableData(response);
						} else {
							response?.msg && this.$message.error(response?.msg);
							this.total = 0;
							this.tableIsLoading = false;
							this.tableData = [];
						}
					})
					.catch((error) => {
						// this.$message.error(this.$t('系统接口') + this.$t('异常'))
						this.total = 0;
						this.tableIsLoading = false;
						this.tableData = [];
					})
					.finally(() => {
						this.$emit('after-load', this.tableData || []);
						this.$nextTick(() => {
							this.doLayout();
						});
					});
			}
		},
		change() {
			if (this.autoPageSize) {
				let rowNum = this.getRowNum();
				if (rowNum) {
					this.params.pagination.size = rowNum;
				}
			}
			// 如果:data是String或Function,不会走到这个逻辑
			if (Array.isArray(this.data)) {
				this.tableData = this.data;
				this.sParams?.type !== 'reset' && (this.tableIsLoading = false);
				this.total = this.pageTotal || this.tableData.length;
				this.$emit('after-load', this.tableData || []);
				this.$nextTick(() => {
					this.doLayout();
				});
			} else {
				// 如果params中的分页数size为undefined,则置为默认值10
				this.params.pagination.size = this.params.pagination.size || 10;
				// 如果params中的当前页码current为undefined,则置为默认值1
				this.params.pagination.current = this.params.pagination.current || 1;

				// 让页面中的分页数size和当前页码current与params中的参数保持一致
				this.pageConfig.currentPage = this.params.pagination.current;
				this.pageConfig.pageSize = this.params.pagination.size;
				const sParams = this.sParamsFilter(this.sParams);
				return this.parseData({
					...this.params.form,
					...this.params.pagination,
					...sParams,
				});
			}
		},
		// 将传入的sParams与biz-table的uid对应.须保证uid全局唯一.
		sParamsFilter(sParams) {
			const sParamsCopy = deepClone(sParams);
			return sParamsCopy[this.uid] || {};
		},
		search(params) {
			this.params.form = {
				...this.params.form,
				...params,
			};
			// 点击搜索重置分页
			this.resetPage();
			// this.params.pagination.current = 1;
			if (this.$attrs.onSearch) {
				return this.$emit('search', params);
			} else {
				return this.change();
			}
		},
		reset(params) {
			this.params.form = params;
			this.$emit('reset', params);
		},
		sizeChange(size) {
			this.params.pagination.size = size;
			this.params.pagination.current = 1;
			this.change();
			this.$emit('size-change', size);
		},
		currentChange(current) {
			this.params.pagination.current = current;
			this.change();
			this.$emit('current-change', current);
			this.$emit('page-current-change', current);
		},
		async getData(isReset = true) {
			try {
				if (this.page !== false && this.$refs.page) {
					this.params.pagination = await this.$refs.page.getParams();
				}
				if (this.form && this.$refs.form) {
					this.params.form = await this.$refs.form.getParams();
				}
				// 触发查询重置
				// this.params.pagination.current = 1;
				isReset && this.resetPage();
				return this.change();
			} catch (error) {
				if (returnGlobalValue('NODE_ENV') === 'development')
					console.error('table debugger:', error);
			}
		},
		rowDrop() {
			this.dragTableBody = document
				.getElementById('l-table-lq')
				.querySelector('.l-table__body-wrapper tbody');
			const _this = this;
			Sortable.create(this.dragTableBody, {
				onEnd(evt) {
					const { newIndex, oldIndex } = evt;
					const currRow = _this.tableData.splice(oldIndex, 1)[0];
					_this.$emit('drag', newIndex, oldIndex, currRow);
					_this.tableData.splice(newIndex, 0, currRow);
				},
			});
		},
		setFilteredColumn() {
			const renderLabel = new RenderLabel();
			this.cols.forEach((element) => {
				if (!element.hidden) element.hidden = false;
				typeof element.label === 'undefined'
					? (element.none = true)
					: (element.none = false);
				let _label = renderLabel.getLabel(element.label);
				if (!element.columnSelectedKey) {
					element.columnSelectedKey = uuidv4();
					element.columnSelectedLabel = _label;
				}
			});
			this.selectedInFilteredColumn = this.cols
				.filter((ele) => {
					return !ele.hidden;
				})
				.map((ele) => ele.columnSelectedKey);
		},
		refresh() {
			updateHosBizTable({ _uid: this.uid });
		},
		resetPage() {
			if (this.queryCache) {
			} else if (
				Object.prototype.toString.call(this.page) === '[object Object]'
			) {
				this.params.pagination.current = this.page.currentPage || 1;
				this.params.pagination.size = this.page.pageSize || 10;
			} else {
				this.params.pagination.current = 1;
				// this.params.pagination.size = 10;
			}
		},
		changeFilteredColumn(val) {
			this.cols.forEach((element) => {
				this.selectedInFilteredColumn.includes(element.columnSelectedKey)
					? (element.hidden = false)
					: (element.hidden = true);
			});
		},
		async sortChange({ column, prop, order }) {
			if (this.form) {
				this.params.form = await this.$refs.form.getParams();
			}
			if (column.sortable === 'custom') {
				this.params.form.sort = prop;
				this.params.form.order = order;
				if (order === 'ascending') {
					this.params.form.order = 'asc';
				} else if (order === 'descending') {
					this.params.form.order = 'desc';
				} else {
					delete this.params.form.sort;
					delete this.params.form.order;
				}
				this.change();
			}
		},
		fitHeight(tableHeight) {
			// 此处传入的高度可以是number(如:200),可以是string(如:200px)
			// isFit必须是false,否则table样式flex:1 导致传入值不生效.
			if (tableHeight) {
				// 传入值时, 将此值作为table的高度
				this.height = tableHeight;
			} else {
				// 未传入值时, 将剩余高度作为table的高度
				const element = this.$refs['l-table-' + this.uid]?.$el;
				if (!element) return;
				this.height = element.offsetHeight;
			}
			this.$nextTick(() => {
				this.doLayout();
			});
		},
		// 处理表格行数自适应
		getRowNum() {
			if (this.isFit && this.$refs['l-table-' + this.uid]) {
				let rowHeight, headRowHeight, sumRowHeight;
				if (this.uiStyle == 0) {
					rowHeight = 32; // 行高
					headRowHeight = 32; //表头行高
					sumRowHeight = this.$attrs['show-summary'] !== undefined ? 32 : 0; // 合计行高
				} else {
					rowHeight = 42; // 行高
					headRowHeight = 53; //表头行高
					sumRowHeight = this.$attrs['show-summary'] !== undefined ? 44 : 0; // 合计行高
				}

				let tableHeight = this.$refs['l-table-' + this.uid].$el.offsetHeight; // 表格高度
				let rowNum = Math.floor(
					(tableHeight - headRowHeight - sumRowHeight) / rowHeight
				);
				return rowNum;
			}
			return null;
		},
		convertCurrentChange(currentRow, oldCurrentRow) {
			this.$emit('current-row-change', currentRow, oldCurrentRow);
		},
	},
	created() {
		this.unsubscribe = subscribeHosBizTableMutations((type) => {
			this.$nextTick(() => {
				if (type === 'UPDATE_TABLE') {
					if (
						this.sUID === this.uid ||
						(this.sUID === 0 && this.sEvent === 'update')
					) {
						this.sParams?.type === 'reset' && (this.tableIsLoading = true);
						this.$nextTick(() => {
							this.getData();
						});
					}
				} else if (type === 'REFRESH_TABLE') {
					if (
						this.sUID === this.uid ||
						(this.sUID === 0 && this.sEvent === 'refresh')
					) {
						this.sParams?.type === 'reset' && (this.tableIsLoading = true);
						this.$nextTick(() => {
							this.getData(false);
						});
					}
				}
			});
		});
		this.isChrome49();
	},
	mounted() {
		if (this.init) {
			this.getData();
		} else {
			this.tableData = Array.isArray(this.data) ? this.data : this.tableData;
			this.total = this.tableData?.length || 0;
			this.$emit('after-load', this.tableData);
			this.$nextTick(() => {
				this.doLayout();
			});
		}
		// 拖拽行
		if (this.dragable) {
			this.rowDrop();
		}
		// 显示/隐藏列
		if (this.columnSelected) {
			this.setFilteredColumn();
		}
		// mounted阶段主动调用, 避免IE浏览器下高度错误.
		if (this.isFit) {
			this.fitHeight();
		}
	},
	beforeUnmount() {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	},
};
</script>
<style lang="scss" scoped>
.l-biz-table {
	flex-direction: column;
	height: 100%;
	background: transparent;
	&.flex {
		display: flex;
	}
	.l-table {
		::v-deep .l-table__body-wrapper {
			outline: none; // 聚焦时会有outline,主动取消outline样式
		}
		::v-deep .l-table__fixed {
			// 处于表格固定列内的横向滚动条无法拖动. 如果列数过多,固定列宽度大于横向滚动条长度时,会导致整个滚动条无法拖动.
			// 以下样式用于修复此问题.使得在固定列内的横向滚动条也可以拖动.
			pointer-events: none;
			// 将直接子元素显式声明为默认值"auto"
			& > * {
				pointer-events: auto;
			}
		}
	}
	// .l-biz-toolbar {
	// 	overflow: hidden;
	// }
}
.none {
	display: none;
}
</style>

<style lang="scss">
//分页未对齐的兼容问题
.chrome49.l-biz-table {
	.l-pagination button,
	.l-pagination span:not([class*='suffix']) {
		line-height: 31px;
	}
	.l-pagination span.l-pagination__ssizes:not([class*='suffix']) {
		line-height: 26px;
	}
}
// 隐藏biz-table的input__validateIcon校验图标
.l-biz-table {
	& .l-biz-pagination {
		& .l-pagination__ssizes {
			.l-input__suffix {
				.l-input__validateIcon {
					display: none;
				}
			}
		}
	}
}
</style>
