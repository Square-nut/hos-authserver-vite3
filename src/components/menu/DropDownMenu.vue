<template>
	<div>
		<el-dropdown placement="bottom" @command="clickMenu" class="userInfo">
			<!-- 菜单内的帮助文档 -->
			<div class="drop-user">
				<el-avatar
					style="vertical-align: sub"
					:size="18"
					:src="avatar"
				></el-avatar>
				<span style="padding-left: 3px">{{ userInfo.name }}</span>
			</div>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item
						v-for="(item, index) in dropDownMenus"
						:key="index"
						:command="item"
					>
						{{ item.meta.title }}
					</el-dropdown-item>
					<el-dropdown-item @click="setPssword" :icon="Setting">
						修改密码</el-dropdown-item
					>
					<el-dropdown-item @click="handlerLogout" :icon="SwitchButton">
						退出登录</el-dropdown-item
					>
					<!-- <el-dropdown-item v-if="simple == 0">
          <span
            >左侧菜单：
            <hos-switch
              v-model="simpleLeftMenu"
              active-color="#13ce66"
              inactive-color="#ff4949"
              active-value="1"
              inactive-value="0"
              size="mini"
              @change="changeMenu"
            >
            </hos-switch>
          </span>
        </el-dropdown-item> -->
				</el-dropdown-menu>
			</template>
		</el-dropdown>
		<!--  设置按钮 SZWW  -->
		<el-dropdown
			v-if="simple == 0"
			placement="bottom"
			trigger="click"
			class="setUp"
			:hide-on-click="false"
		>
			<div class="drop-user">
				<el-icon><Setting /></el-icon>
			</div>
			<template #dropdown>
				<el-dropdown-menu class="headMenu_setUp">
					<el-dropdown-item>
						<img src="@/assets/images/helpImg.png" />
						<span @click="openHelpDoc()">帮助文档</span>
					</el-dropdown-item>
				<!--        <el-dropdown-item>-->
				<!--          <img src="@/assets/images/colorImg.png" />-->
				<!--          <span>系统颜色转换</span>-->
				<!--          <div class="color">-->
				<!--            <span-->
				<!--              @click="changeColor('blue')"-->
				<!--              :class="{ active: themeColor == 'blue' }"-->
				<!--              >蓝</span-->
				<!--            >-->
				<!--            <span-->
				<!--              @click="changeColor('green')"-->
				<!--              :class="{ active: themeColor == 'green' }"-->
				<!--              >绿</span-->
				<!--            >-->
				<!--            <span-->
				<!--              @click="changeColor('purple')"-->
				<!--              :class="{ active: themeColor == 'purple' }"-->
				<!--              >紫</span-->
				<!--            >-->
				<!--          </div>-->
				<!--        </el-dropdown-item>-->
				<!--        <el-dropdown-item>-->
				<!--          <img src="@/assets/images/fontImg.png" />-->
				<!--          <span>文字大小转换</span>-->
				<!--          <div class="font">-->
				<!--            <span-->
				<!--              @click="changeFontSize('large')"-->
				<!--              :class="{ active: themeFont == 'large' }"-->
				<!--              >大</span-->
				<!--            >-->
				<!--            <span-->
				<!--              @click="changeFontSize('default')"-->
				<!--              :class="{ active: themeFont == 'default' }"-->
				<!--              >中</span-->
				<!--            >-->
				<!--            <span-->
				<!--              @click="changeFontSize('small')"-->
				<!--              :class="{ active: themeFont == 'small' }"-->
				<!--              >小</span-->
				<!--            >-->
				<!--          </div>-->
				<!--        </el-dropdown-item>-->
				<!--        <el-dropdown-item>-->
				<!--          <img src="@/assets/images/fontImg.png" />-->
				<!--          <span>中英文切换</span>-->
				<!--          <div class="font">-->
				<!--            <span-->
				<!--              @click="chinese('zh')"-->
				<!--              :class="{ active: themeFamily == 'zh' }"-->
				<!--              >中文</span-->
				<!--            >-->
				<!--            <span-->
				<!--              @click="english('en')"-->
				<!--              :class="{ active: themeFamily == 'en' }"-->
				<!--              >英文</span-->
				<!--            >-->
				<!--          </div>-->
				<!--        </el-dropdown-item>-->
				</el-dropdown-menu>
			</template>
		</el-dropdown>
		<!--  设置按钮 EZWW  -->
		<el-biz-dialog
			:title="dialogTitle"
			:width="width"
			uid="menuDialog"
			:close-on-click-modal="false"
		>
		</el-biz-dialog>
		<el-biz-dialog
			title="修改密码"
			width="800px"
			uid="setPassword"
			:close-on-click-modal="false"
		></el-biz-dialog>
	</div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { Setting, SwitchButton } from '@element-plus/icons-vue';
import themeConfig from '@/utils/theme/themeConfig';
import { useUserStore } from '@/stores/user';
import setPassword from './setPassword.vue';
import { openHosBizDialog } from '@/composables/useHosBiz';

const viewModules = import.meta.glob('/src/views/**/*.vue');
const frameModules = import.meta.glob('/src/components/layouts/**/*.vue');

function resolveViewImporter(componentPath) {
	const normalized = componentPath.startsWith('/') ? componentPath : `/${componentPath}`;
	const base = `/src/views${normalized}`;
	const candidates = [base, `${base}.vue`, `${base}/index.vue`];
	const match = candidates.find((path) => viewModules[path]);
	return match ? viewModules[match] : null;
}

function resolveFrameImporter() {
	const candidates = [
		'/src/components/layouts/IframePageView.vue',
		'/src/components/layouts/IframePageView/index.vue',
	];
	const match = candidates.find((path) => frameModules[path]);
	return match ? frameModules[match] : null;
}
export default {
	name: 'DropDownMenu',
	components: { Setting, SwitchButton },

	data() {
		return {
			simple: import.meta.env.VITE_APP_THEME_STYLE ?? import.meta.env.VUE_APP_THEME_STYLE ?? '0',
			simpleLeftMenu: localStorage.getItem('leftMenu'),
			dialogTitle: '',
			width: '50%',
			themeColor: localStorage.getItem('theme'),
			themeFont: localStorage.getItem('fontSize'),
			themeFamily: localStorage.getItem('fontFamily'),
		};
	},
	computed: {
		permissionMenuList() {
			return useUserStore().menuList;
		},
		dropDownMenus() {
			return useUserStore().dropDownMenus;
		},
		avatar() {
			return useUserStore().avatar;
		},
		userInfo() {
			return useUserStore().info || {};
		},
	},
	created() {
		let theme = localStorage.getItem('theme');
		if (theme) {
			this.changeTheme(theme);
		}
		if (localStorage.getItem('fontFamily') == 'zh') {
			this.$i18n.locale = 'zh';
		}
	},
	watch: {
		defaultTheme: {
			handler: function (val, oldVal) {
				this.theme = val;
			},
			immediate: true,
		},
	},

	methods: {
		// 修改密码
		setPssword() {
			console.log('修改密码');
			openHosBizDialog({
				component: setPassword,
				_uid: 'setPassword',
				props: {
					status: 'edit:',
				},
			});
		},
		handlerLogout() {
			useUserStore()
				.Logout({ initiativeLogout: true })
				.then(() => {
					location.reload();
				});
		},
		openHelpDoc() {
			window.open('http://114.242.246.250:8034/');
		},
		//设置中英文两个切换方法
		chinese() {
			this.$i18n.locale = 'zh';
			localStorage.setItem('fontFamily', 'zh');
			this.themeFamily = 'zh';
		},
		english() {
			this.$i18n.locale = 'en';
			localStorage.setItem('fontFamily', 'en');
			this.themeFamily = 'en';
		},
		changeMenu(val) {
			localStorage.setItem('leftMenu', val);
			this.$emit('changeMenuType', val);
		},
		changeColor(color) {
			localStorage.setItem('theme', color);
			this.changeTheme(color);
			location.reload();
		},
		changeTheme(theme) {
			const config = themeConfig[theme];
			Object.keys(config).forEach((key) => {
				document
					.getElementsByTagName('body')[0]
					.style.setProperty(key, config[key]);
			});
		},
		changeFontSize(size) {
			localStorage.setItem('fontSize', size);
			location.reload();
		},

		clickMenu(command) {
			if (!command) {
				return;
			}
			let menu = command;
			if (!menu.meta.isDialog) {
				this.$router.push({ path: menu.path });
			} else {
				const componentPath = menu.meta.componentPath;
				let importer = null;
				if (menu.meta.isFrame) {
					importer = resolveFrameImporter();
				} else {
					importer = resolveViewImporter(componentPath);
				}
				if (!importer) {
					this.$message.error('页面组件不存在，请检查菜单配置');
					return;
				}
				const component = defineAsyncComponent(importer);
				//  打开一个弹窗
				this.dialogTitle = menu.meta.title;
				openHosBizDialog({
					_uid: 'menuDialog',
					component: component,
					props: menu.props,
				});
			}
		},
	},
};
</script>
<style scoped>
.drop-user {
	height: 40px;
	line-height: 40px;
}
</style>
