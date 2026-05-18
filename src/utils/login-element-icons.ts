/**
 * 登录页图标：由原 el-icom-* / hos-icom-* 映射到 Element Plus Icons
 */
import {
	Avatar,
	Briefcase,
	Cellphone,
	InfoFilled,
	Key,
	Picture,
	Refresh,
	Setting,
	User,
	View,
} from '@element-plus/icons-vue';

export const LoginIcons = {
	User,
	Key,
	Picture,
	Briefcase,
	Cellphone,
	Avatar,
	Refresh,
	View,
	InfoFilled,
	Setting,
} as const;

/** CA 登录方式 -> 图标 */
export const caLoginTypeIconMap: Record<string, typeof Key> = {
	UKEY: Key,
	PHONE: Cellphone,
	PINPHONE: Key,
	FACE: Avatar,
};
