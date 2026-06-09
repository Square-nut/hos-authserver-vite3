<template>
  <hos-container class="main">
    <hos-header class="simple_header" style="height: 40px" v-if="simple == 0">
      <hos-row>
        <hos-col :span="4">
          <div class="logo-title">
            <img src="@/assets/HO@2x.png" alt="logo1" />
            <div title="基础应用框架">基础应用框架</div>
          </div>
        </hos-col>
        <hos-col :span="17">
          <hos-menu
            v-if="simpleLeftMenu === '1'"
            class="mid-nav"
            text-color="#ffffff"
            @select="topLeftMenuSelect"
            mode="horizontal"
            menu-trigger="click"
          >
            <template v-for="item in menuList">
              <hos-menu-item
                :disabled="item.disabled"
                :index="item.name + ''"
                :key="item.name + ''"
              >
                {{ item.meta.title }}
              </hos-menu-item>
            </template>
          </hos-menu>
          <hos-menu
            v-if="simpleLeftMenu === '0'"
            class="mid-nav"
            style="color: #fff"
            @select="menuSelect"
            :default-active="route.path"
            :collapse-transition="false"
            :unique-opened="true"
            mode="horizontal"
            expand-icon="hos-icon-caret-bottom"
            pack-up-icon="hos-icon-caret-right"
          >
			<side-menu :showIcon="false" :menuList="menuList as any"></side-menu>
          </hos-menu>
        </hos-col>
        <hos-col :span="3" class="top-right-simple">
          <drop-down-menu @changeMenuType="changeMenuType"></drop-down-menu>
        </hos-col>
      </hos-row>
    </hos-header>
    <hos-main style="padding: 0" v-if="simple == 0">
      <hos-container class="main">
        <hos-aside
          v-if="twoMenuList.length != 0 && simpleLeftMenu === '1'"
          :width="isCollapse ? '40px' : '220px'"
        >
          <div class="toggle_box">
            <i
              :class="isCollapse ? 'fa fa-bars h' : 'fa fa-bars'"
              @click="toggleCollapse"
            ></i>
          </div>
          <hos-menu
            class="hos-menu-vertical-demo menuLeftMain"
            @select="menuSelect"
            :collapse="isCollapse"
            :default-active="route.path"
            :collapse-transition="false"
            :unique-opened="true"
          >
            <side-menu :showIcon="true" :menuList="twoMenuList as any"></side-menu>
          </hos-menu>
        </hos-aside>
        <hos-main
          class="hos-main-navigation"
          style="padding: 0; background-color: #f5f5f5"
        >
          <slot></slot>
        </hos-main>
      </hos-container>
    </hos-main>

    <!--hos侧边栏-->
    <hos-aside :width="isCollapse ? '40px' : '220px'" v-if="simple == 1">
      <!--展开/收起-->
      <div class="logo-title">
        <img src="@/assets/logo1.png" alt="logo1" />
        <h3 :style="isCollapse ? 'display:none' : 'display:block'">
          基础应用框架
        </h3>
      </div>
      <div class="toggle_box">
        <i
          :class="isCollapse ? 'fa fa-bars h' : 'fa fa-bars'"
          @click="toggleCollapse"
        ></i>
      </div>
      <hos-menu
        class="hos-menu-vertical-demo menuLeftMain"
        @select="menuSelect"
        text-color="#ffffff"
        active-text-color="#eaeaea"
        :collapse="isCollapse"
        :default-active="route.path"
        :collapse-transition="false"
        :unique-opened="true"
      >
        <side-menu :showIcon="true" :menuList="menuList as any"></side-menu>
      </hos-menu>
    </hos-aside>
    <hos-container v-if="simple == 1">
      <hos-header style="height: 40px; padding: 0">
        <hos-row>
          <hos-col :span="21" class="top-left">
            <div class="hos-icon-map-location bre-span"></div>
            <hos-breadcrumb>
              <hos-breadcrumb-item v-for="(item, index) in bran" :key="index">
                <span style="color: #fff">{{ item.title }}</span>
              </hos-breadcrumb-item>
            </hos-breadcrumb>
          </hos-col>
          <hos-col :span="3" class="top-right">
            <drop-down-menu @changeMenuType="changeMenuType"></drop-down-menu>
          </hos-col>
        </hos-row>
      </hos-header>

      <hos-main style="padding: 0" class="hos-main-navigation">
        <slot></slot>
      </hos-main>
    </hos-container>
  </hos-container>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import SideMenu from '@/components/menu/SideMenu.vue'
import DropDownMenu from '@/components/menu/DropDownMenu.vue'
import { useUserStore } from '@/stores/user'
import { useHosBizDialogStore } from '@/stores/hosBizDialog'
import { UI_THEME } from '@/constants/ui-theme'
import { resolveViewComponent } from '@/utils/resolve-view-component'

defineOptions({ name: 'Main' })

const emit = defineEmits<{
	dynamicRouterShow: [index: string, title: string]
}>()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const dialogStore = useHosBizDialogStore()
const { menuList: permissionMenuList } = storeToRefs(userStore)

const isCollapse = ref(false)
const rightMenu = ref(false)
const searchMenu = ref('')
const searchInput = ref(false)
const activeMenu = ref<Record<string, any>>({})
const menuList = ref<Record<string, any>[]>([])
const twoMenuList = ref<Record<string, any>[]>([])
const bran = ref<{ name: string; path: string; title: string }[]>([])
const simple = UI_THEME
const simpleLeftMenu = ref(localStorage.getItem('leftMenu') || '0')

watch(
	() => route.fullPath,
	() => {
		getRouterBran()
	},
	{ immediate: true },
)

onBeforeMount(() => {
	menuList.value = permissionMenuList.value
	getTwoMenuList()
	if (bran.value[0]?.name != 'welcome') {
		topLeftMenuSelect(bran.value[0]?.name)
	}
})

function getTwoMenuList() {
	const flagName = route.name
	if (flagName == 'welcome') {
		if (menuList.value[0]?.children) {
			twoMenuList.value = menuList.value[0]?.children
		}
	} else {
		permissionMenuList.value.filter((item) => {
			if (item.children.length != 0) {
				item.children.filter(
					(
						key: Record<string, any>,
						_index: number,
						originarr: Record<string, any>[],
					) => {
						if (key.name === flagName) {
							twoMenuList.value = originarr
							return
						}
					},
				)
			}
			return
		})
	}
}

function getRouterBran() {
	const matchedFil = route.matched.filter((v) => v.name)
	const arr: { name: string; path: string; title: string }[] = []
	matchedFil.forEach((v) => {
		if (v.name == 'dashboard') return
		arr.push({
			name: String(v.name),
			path: v.path,
			title: String(v.meta.title ?? ''),
		})
	})
	bran.value = arr
}

function searchInpuToggle() {
	searchInput.value = !searchInput.value
}

function searchMenuEven() {}

function toggleCollapse() {
	isCollapse.value = !isCollapse.value
}

function menuSelect(index: string, _indexPath?: string[]) {
	findMenuBykey(menuList.value, index)
	if (activeMenu.value.meta?.isDialog) {
		const componentPath = activeMenu.value.meta.componentPath
		const component = resolveViewComponent(
			componentPath,
			activeMenu.value.meta.isFrame,
		)
		dialogStore.OPEN_DIALOG({
			_uid: 'menuDialog',
			component: component,
			props: activeMenu.value.props,
		})
	} else {
		router.push({ path: activeMenu.value.path })
	}
	emit('dynamicRouterShow', index, activeMenu.value.meta?.title ?? '')
}

function topLeftMenuSelect(index?: string, _indexPath?: string[]) {
	if (!index) return
	sessionStorage.setItem('menuIndex', index)
	const list = menuList.value.filter((item) => {
		return item.name == index
	})
	if (!list || list.length == 0) {
		return
	}
	if (list[0]?.children) {
		twoMenuList.value = list[0].children
	} else {
		twoMenuList.value = []
		if (list[0]?.path) router.push(list[0].path)
	}
}

function changeMenuType() {
	simpleLeftMenu.value = localStorage.getItem('leftMenu') ?? '0'
	const ind = sessionStorage.getItem('menuIndex')
	if (ind && ind != 'welcome') {
		const list = menuList.value.filter((item) => {
			return item.name == ind
		})
		if (!list || list.length == 0) {
			return
		}
		if (list[0]?.children) {
			twoMenuList.value = list[0].children
		}
	}
}

function findMenuBykey(menus: Record<string, any>[], key: string) {
	for (const i of menus) {
		if (i.name == key) {
			activeMenu.value = { ...i }
		} else if (i.children && i.children.length > 0) {
			findMenuBykey(i.children, key)
		}
	}
}
</script>
<style lang="scss" scoped>
@import "@/assets/style/variables.scss";
.hos-menu--horizontal > .hos-menu-item:not(.is-disabled):hover,
.hos-menu--horizontal > .hos-menu-item:not(.is-disabled):focus,
.hos-menu-item:not(.is-disabled):hover,
.hos-menu-item:hover {
  background-color: $--one-menu-hover-color;
  color: #fff;
}
</style>
