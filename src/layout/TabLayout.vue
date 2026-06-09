<template>
  <global-layout v-if="showMenu" @dynamicRouterShow="dynamicRouterShow">
    <div style="overflow: hidden">
      <!-- 标签 -->
      <div class="tab_multiple">
        <hos-tabs
            v-show="pageList.length > 0"
            v-model="activePage"
            type="system"
            closable
            @tab-remove="removePage"
            @tab-click="changePage"
        >
          <hos-tab-pane
              v-for="page in pageList"
              :key="page.name"
              :label="page.meta.title"
              :name="page.name"
              :closable="!(page.meta.title == '首页')"
          >
          </hos-tab-pane>
        </hos-tabs>
      </div>
      <div class="tab_icon">
        <hos-dropdown trigger="click" @command="closeCommand">
          <i class="fa fa-bars"></i>
          <template #dropdown>
            <hos-dropdown-menu>
              <hos-dropdown-item command="closeAll">关闭全部</hos-dropdown-item>
              <hos-dropdown-item command="closeOthers"
              >关闭其它</hos-dropdown-item
              >
            </hos-dropdown-menu>
          </template>
        </hos-dropdown>
      </div>
    </div>
    <!--路由视图-->
    <div class="calc-sign">
      <keep-alive v-if="keepAlive">
        <router-view />
      </keep-alive>
      <router-view v-else />
      <!--        <route-view></route-view>-->
    </div>
  </global-layout>
  <div v-else>
    <keep-alive v-if="keepAlive">
      <router-view />
    </keep-alive>
    <router-view v-else />
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import GlobalLayout from '@/layout/GlobleLayout.vue'

defineOptions({ name: 'TabLayout' })

const welcomeKey = 'welcome'

const route = useRoute()
const router = useRouter()

const pageList = ref<Record<string, any>[]>([])
const linkList = ref<string[]>([])
const activePage = ref('')
const multipage = ref(true)
const showMenu = ref(true)

const keepAlive = computed(() => route.meta.keepAlive)

watch(
	() => route.fullPath,
	() => {
		const newRoute = route
		const newPage = Object.assign({}, newRoute)
		newPage.meta = Object.assign({}, newRoute.meta)
		activePage.value = String(newPage.name ?? '')
		if (!multipage.value) {
			linkList.value = [String(newPage.name ?? '')]
			pageList.value = [Object.assign({}, newPage)]
		} else if (linkList.value.indexOf(String(newPage.name ?? '')) < 0) {
			if (newPage.query.title) {
				newPage.meta.title =
					newPage.query.title + '-' + newPage.meta.title
			}
			linkList.value.push(String(newPage.name ?? ''))
			pageList.value.push(newPage)
		} else if (linkList.value.indexOf(String(newPage.name ?? '')) >= 0) {
			const oldIndex = linkList.value.indexOf(String(newPage.name ?? ''))
			if (newPage.query.title) {
				newPage.meta.title =
					newPage.query.title + '-' + newPage.meta.title
			}
			pageList.value.splice(oldIndex, 1, newPage)
		}
	},
)

watch(activePage, (key) => {
	for (const page of pageList.value) {
		if (page.name === key) {
			router.push(Object.assign({}, page))
		}
	}
})

function addIndexToFirst() {
	pageList.value.splice(0, 0, {
		name: welcomeKey,
		path: '/main/welcome',
		fullPath: '/main/welcome',
		meta: {
			icon: 'dashboard',
			title: '首页',
		},
	})
	linkList.value.splice(0, 0, welcomeKey)
}

function dynamicRouterShow(_key: string, _title: string) {
	console.log('--------dynamicRouterShow--------')
}

function changePage(key: { name: string }) {
	activePage.value = key.name
}

function removePage(key: string) {
	if (key == welcomeKey) {
		ElMessage.warning('首页不能关闭!')
		return
	}
	if (pageList.value.length === 1) {
		ElMessage.warning('这是最后一页，不能再关闭了啦')
		return
	}
	pageList.value = pageList.value.filter((item) => item.name !== key)
	let index = linkList.value.indexOf(key)
	linkList.value = linkList.value.filter((item) => item !== key)
	index = index >= linkList.value.length ? linkList.value.length - 1 : index
	activePage.value = linkList.value[index] ?? ''
}

function closeCommand(command: string) {
	switch (command) {
		case 'closeAll':
			closeAll()
			break
		case 'closeOthers':
			closeOthers()
			break
		default:
			break
	}
}

function closeAll() {
	pageList.value.splice(1, pageList.value.length - 1)
	linkList.value.splice(1, linkList.value.length - 1)
	activePage.value = linkList.value[0] ?? ''
}

function closeOthers() {
	const index = linkList.value.indexOf(activePage.value)
	if (activePage.value == welcomeKey) {
		linkList.value = linkList.value.slice(index, index + 1)
		pageList.value = pageList.value.slice(index, index + 1)
		activePage.value = linkList.value[0] ?? ''
	} else {
		const indexContent = pageList.value[0]
		if (!indexContent) return
		linkList.value = linkList.value.slice(index, index + 1)
		pageList.value = pageList.value.slice(index, index + 1)
		linkList.value.unshift(indexContent.name as string)
		pageList.value.unshift(indexContent)
		activePage.value = linkList.value[1] ?? ''
	}
}

function closeCurrent() {
	removePage(activePage.value)
}

provide('closeCurrent', closeCurrent)

onBeforeMount(() => {
	if (route.name != welcomeKey) {
		addIndexToFirst()
	}
	const currentRoute = Object.assign({}, route)
	currentRoute.meta = Object.assign({}, route.meta)
	pageList.value.push(currentRoute)
	linkList.value.push(String(currentRoute.name ?? ''))
	activePage.value = String(currentRoute.name ?? '')
	if (route.query.showMenu) {
		showMenu.value = route.query.showMenu == 'true'
	}
})
</script>
<style scoped lang="scss">
.calc-sign{
  margin: 11px;
  height: calc(100% - 60px);
}
</style>
