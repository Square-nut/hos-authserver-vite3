<template>
  <div>
    <hos-dropdown placement="bottom" @command="clickMenu" class="userInfo">
      <!-- 菜单内的帮助文档 -->
      <div class="drop-user">
        <hos-avatar
          style="vertical-align: sub"
          :size="18"
          :src="avatar"
        ></hos-avatar>
        <span style="padding-left: 3px">{{ userName }}</span>
      </div>
      <template #dropdown>
        <hos-dropdown-menu>
          <hos-dropdown-item
            v-for="(item, index) in dropDownMenus"
            :key="index"
            :command="item"
            :icon="item.meta.icon ? item.meta.icon : 'hos-icon-menu'"
          >
            {{ item.meta.title }}
          </hos-dropdown-item>
          <hos-dropdown-item @click="setPssword" icon="hos-icon-setting">
            修改密码</hos-dropdown-item
          >
          <hos-dropdown-item @click="handlerLogout" icon="hos-icon-switch-button">
            退出登录</hos-dropdown-item
          >
        </hos-dropdown-menu>
      </template>
    </hos-dropdown>
    <!--  设置按钮 SZWW  -->
    <hos-dropdown
      v-if="simple == 0"
      placement="bottom"
      trigger="click"
      class="setUp"
      :hide-on-click="false"
    >
      <div class="drop-user">
        <i class="hos-icon-setting"></i>
      </div>
      <template #dropdown>
        <hos-dropdown-menu class="headMenu_setUp">
          <hos-dropdown-item>
            <img src="@/assets/images/helpImg.png" />
            <span @click="openHelpDoc()">帮助文档</span>
          </hos-dropdown-item>
        </hos-dropdown-menu>
      </template>
    </hos-dropdown>
    <!--  设置按钮 EZWW  -->
    <hos-biz-dialog
      :title="dialogTitle"
      :width="width"
      uid="menuDialog"
      :close-on-click-modal="false"
    >
    </hos-biz-dialog>
    <hos-biz-dialog
      title="修改密码"
      width="800px"
      uid="setPassword"
      :close-on-click-modal="false"
    ></hos-biz-dialog>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useHosBizDialogStore } from '@/stores/hosBizDialog'
import { UI_THEME } from '@/constants/ui-theme'
import { resolveViewComponent } from '@/utils/resolve-view-component'
import themeConfig from '@/utils/theme/themeConfig'
import SetPassword from './setPassword.vue'

defineOptions({ name: 'DropDownMenu' })

const emit = defineEmits<{
	changeMenuType: [val: string]
}>()

const router = useRouter()
const { locale } = useI18n()

const userStore = useUserStore()
const dialogStore = useHosBizDialogStore()
const { dropDownMenus, avatar, name: userName } = storeToRefs(userStore)

const simple = UI_THEME
const simpleLeftMenu = ref(localStorage.getItem('leftMenu'))
const dialogTitle = ref('')
const width = ref('50%')
const themeColor = ref(localStorage.getItem('theme'))
const themeFont = ref(localStorage.getItem('fontSize'))
const themeFamily = ref(localStorage.getItem('fontFamily'))

onBeforeMount(() => {
	const theme = localStorage.getItem('theme')
	if (theme) {
		changeTheme(theme)
	}
	if (localStorage.getItem('fontFamily') == 'zh') {
		locale.value = 'zh'
	}
})

function setPssword() {
	dialogStore.OPEN_DIALOG({
		component: SetPassword,
		_uid: 'setPassword',
		props: {
			status: 'edit:',
		},
	})
}

function handlerLogout() {
	userStore.Logout({ initiativeLogout: true }).then(() => {
		location.reload()
	})
}

function openHelpDoc() {
	window.open('http://114.242.246.250:8034/')
}

function chinese() {
	locale.value = 'zh'
	localStorage.setItem('fontFamily', 'zh')
	themeFamily.value = 'zh'
}

function english() {
	locale.value = 'en'
	localStorage.setItem('fontFamily', 'en')
	themeFamily.value = 'en'
}

function changeMenu(val: string) {
	localStorage.setItem('leftMenu', val)
	emit('changeMenuType', val)
}

function changeColor(color: string) {
	localStorage.setItem('theme', color)
	changeTheme(color)
	location.reload()
}

function changeTheme(theme: string) {
	const config = themeConfig[theme]
	if (!config) return
	Object.keys(config).forEach((key) => {
		const body = document.getElementsByTagName('body')[0]
		if (!body) return
		body.style.setProperty(key, config[key] ?? '')
	})
}

function changeFontSize(size: string) {
	localStorage.setItem('fontSize', size)
	location.reload()
}

function clickMenu(command: Record<string, any>) {
	if (!command) {
		return
	}
	const menu = command
	if (!menu.meta.isDialog) {
		router.push({ path: menu.path })
	} else {
		const componentPath = menu.meta.componentPath
		const component = resolveViewComponent(
			componentPath,
			menu.meta.isFrame,
		)
		dialogTitle.value = menu.meta.title
		dialogStore.OPEN_DIALOG({
			_uid: 'menuDialog',
			component: component,
			props: menu.props,
		})
	}
}
</script>
<style scoped>
  .drop-user{
    height: 40px;
    line-height: 40px;
  }
</style>
