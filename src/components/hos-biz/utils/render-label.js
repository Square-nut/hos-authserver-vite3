// export default function(value){
//   console.log('log render-label this:',this)
//   return typeof value === 'string'? value: '列'+i
//   // return typeof value === 'string'? value: value({}, this.$createElement)
// }
export default class {
	constructor() {
		this.i = 0;
	}
	getLabel(value) {
		this.value = value;
		if (typeof value === 'string') return value;
		if (typeof value === 'function') {
			try {
				const rendered = value({}, () => null);
				if (typeof rendered === 'string') return rendered;
			} catch {
				/* 列头函数可能依赖完整 scope，回退默认文案 */
			}
		}
		return '自定义列' + ++this.i;
	}
}
