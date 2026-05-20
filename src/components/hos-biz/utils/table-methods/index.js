export const otherMethods = {
	methods: {
		// 转发table方法
		clearSelection() {
			if (
				this.$refs['hos-table-' + this.uid] &&
				this.$refs['hos-table-' + this.uid].$refs['hos-table-lq']
			)
				this.$refs['hos-table-' + this.uid].$refs[
					'hos-table-lq'
				].clearSelection();
		},
		toggleRowSelection(row, selected) {
			if (
				this.$refs['hos-table-' + this.uid] &&
				this.$refs['hos-table-' + this.uid].$refs['hos-table-lq']
			)
				this.$refs['hos-table-' + this.uid].$refs[
					'hos-table-lq'
				].toggleRowSelection(row, selected);
		},
		toggleAllSelection() {
			if (
				this.$refs['hos-table-' + this.uid] &&
				this.$refs['hos-table-' + this.uid].$refs['hos-table-lq']
			)
				this.$refs['hos-table-' + this.uid].$refs[
					'hos-table-lq'
				].toggleAllSelection();
		},
		toggleRowExpansion(row, expanded) {
			if (
				this.$refs['hos-table-' + this.uid] &&
				this.$refs['hos-table-' + this.uid].$refs['hos-table-lq']
			)
				this.$refs['hos-table-' + this.uid].$refs[
					'hos-table-lq'
				].toggleRowExpansion(row, expanded);
		},
		setCurrentRow(row) {
			if (
				this.$refs['hos-table-' + this.uid] &&
				this.$refs['hos-table-' + this.uid].$refs['hos-table-lq']
			)
				this.$refs['hos-table-' + this.uid].$refs['hos-table-lq'].setCurrentRow(
					row
				);
		},
		clearSort() {
			if (
				this.$refs['hos-table-' + this.uid] &&
				this.$refs['hos-table-' + this.uid].$refs['hos-table-lq']
			)
				this.$refs['hos-table-' + this.uid].$refs['hos-table-lq'].clearSort();
		},
		clearFilter(columnKey) {
			if (
				this.$refs['hos-table-' + this.uid] &&
				this.$refs['hos-table-' + this.uid].$refs['hos-table-lq']
			)
				this.$refs['hos-table-' + this.uid].$refs['hos-table-lq'].clearFilter(
					columnKey
				);
		},
		doLayout() {
			if (
				this.$refs['hos-table-' + this.uid] &&
				this.$refs['hos-table-' + this.uid].$refs['hos-table-lq']
			)
				this.$refs['hos-table-' + this.uid].$refs['hos-table-lq'].doLayout();
		},
		sort(prop, order) {
			if (
				this.$refs['hos-table-' + this.uid] &&
				this.$refs['hos-table-' + this.uid].$refs['hos-table-lq']
			)
				this.$refs['hos-table-' + this.uid].$refs['hos-table-lq'].sort(
					prop,
					order
				);
		},
	},
};
