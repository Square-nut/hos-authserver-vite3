import type { Directive, DirectiveBinding } from 'vue'
import { ELEMENTS_AUTH } from '@/store/mutation-types'

const PERMISSION_EDIT = '2'
const PERMISSION_READONLY = '1'
const PERMISSION_INVISIBLE = '0'

interface PermiBindingValue {
	key?: string | string[]
	formRule?: Record<string, unknown>
	elModel?: string | string[]
}

function applyPermiVisibility(el: HTMLElement, binding: DirectiveBinding<PermiBindingValue>): void {
	const { key, formRule, elModel } = binding.value || {}
	const hasPermissions = getPermissionValue(key)
	if (hasPermissions && hasPermissions === PERMISSION_INVISIBLE) {
		el.parentNode && el.parentNode.removeChild(el)
		if (formRule && elModel) {
			if (typeof elModel === 'string') {
				delete formRule[elModel]
			} else {
				for (const model of elModel) {
					delete formRule[model]
				}
			}
		}
	}
}

/**
 * v-has-permi 元素显示隐藏的权限指令（Vue 3）
 */
export const hasPermi: Directive<HTMLElement, PermiBindingValue> = {
	mounted(el, binding) {
		applyPermiVisibility(el, binding)
	},
	updated(el, binding) {
		applyPermiVisibility(el, binding)
	},
}

export const isDisabled = (permissionKey: string): boolean => {
	const hasPermissions = getPermissionValue(permissionKey)
	return !!(hasPermissions && hasPermissions === PERMISSION_READONLY)
}

export const colAuthFilter = <T extends { permiKey?: string; children?: T[] }>(columns: T[]): T[] => {
	return [...getPermissionCols(columns)]
}

function getPermissionCols<T extends { permiKey?: string; children?: T[] }>(columns: T[]): T[] {
	const newCols = []
	for (const col of columns) {
		let hasPermission = true
		if (col.permiKey) {
			const permissionValue = getPermissionValue(col.permiKey)
			if (permissionValue === PERMISSION_INVISIBLE) {
				hasPermission = false
			}
		}
		if (hasPermission) {
			newCols.push(col)
			if (col.children && col.children.length > 0) {
				col.children = [...getPermissionCols(col.children)]
			}
		}
	}
	return newCols
}

function getPermissionValue(permissionKey?: string | string[]): string {
	const elementsAuth = JSON.parse(sessionStorage.getItem(ELEMENTS_AUTH) || '[]') as Record<string, string> & { length?: number }
	if (elementsAuth.length === 0) {
		return PERMISSION_EDIT
	}
	if (permissionKey) {
		if (typeof permissionKey === 'string') {
			return elementsAuth[permissionKey] ? elementsAuth[permissionKey] : PERMISSION_EDIT
		}
		const hasPermission = permissionKey.some((key) => {
			const permissionValue = elementsAuth[key] ? elementsAuth[key] : PERMISSION_EDIT
			return permissionValue === PERMISSION_EDIT
		})
		return hasPermission ? PERMISSION_EDIT : PERMISSION_INVISIBLE
	}
	throw new Error('请设置操作权限标签值')
}
