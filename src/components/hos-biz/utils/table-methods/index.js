export const otherMethods = {
	methods: {
		// 转发table方法
		clearSelection() {
			if (
				this.$refs['l-table-' + this.uid] &&
				this.$refs['l-table-' + this.uid].$refs['l-table-lq']
			)
				this.$refs['l-table-' + this.uid].$refs['l-table-lq'].clearSelection();
		},
		toggleRowSelection(row, selected) {
			if (
				this.$refs['l-table-' + this.uid] &&
				this.$refs['l-table-' + this.uid].$refs['l-table-lq']
			)
				this.$refs['l-table-' + this.uid].$refs[
					'l-table-lq'
				].toggleRowSelection(row, selected);
		},
		toggleAllSelection() {
			if (
				this.$refs['l-table-' + this.uid] &&
				this.$refs['l-table-' + this.uid].$refs['l-table-lq']
			)
				this.$refs['l-table-' + this.uid].$refs[
					'l-table-lq'
				].toggleAllSelection();
		},
		toggleRowExpansion(row, expanded) {
			if (
				this.$refs['l-table-' + this.uid] &&
				this.$refs['l-table-' + this.uid].$refs['l-table-lq']
			)
				this.$refs['l-table-' + this.uid].$refs[
					'l-table-lq'
				].toggleRowExpansion(row, expanded);
		},
		setCurrentRow(row) {
			if (
				this.$refs['l-table-' + this.uid] &&
				this.$refs['l-table-' + this.uid].$refs['l-table-lq']
			)
				this.$refs['l-table-' + this.uid].$refs['l-table-lq'].setCurrentRow(
					row
				);
		},
		clearSort() {
			if (
				this.$refs['l-table-' + this.uid] &&
				this.$refs['l-table-' + this.uid].$refs['l-table-lq']
			)
				this.$refs['l-table-' + this.uid].$refs['l-table-lq'].clearSort();
		},
		clearFilter(columnKey) {
			if (
				this.$refs['l-table-' + this.uid] &&
				this.$refs['l-table-' + this.uid].$refs['l-table-lq']
			)
				this.$refs['l-table-' + this.uid].$refs['l-table-lq'].clearFilter(
					columnKey
				);
		},
		doLayout() {
			if (
				this.$refs['l-table-' + this.uid] &&
				this.$refs['l-table-' + this.uid].$refs['l-table-lq']
			)
				this.$refs['l-table-' + this.uid].$refs['l-table-lq'].doLayout();
		},
		sort(prop, order) {
			if (
				this.$refs['l-table-' + this.uid] &&
				this.$refs['l-table-' + this.uid].$refs['l-table-lq']
			)
				this.$refs['l-table-' + this.uid].$refs['l-table-lq'].sort(prop, order);
		},
	},
};
