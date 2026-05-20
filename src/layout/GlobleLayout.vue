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
            v-if="simpleLeftMenu == 1"
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
            v-if="simpleLeftMenu == 0"
            class="mid-nav"
            style="color: #fff"
            @select="menuSelect"
            :default-active="$route.path"
            :collapse-transition="false"
            :unique-opened="true"
            mode="horizontal"
            expand-icon="hos-icon-caret-bottom"
            pack-up-icon="hos-icon-caret-right"
          >
            <side-menu :showIcon="false" :menuList="menuList"></side-menu>
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
          v-if="twoMenuList.length != 0 && simpleLeftMenu == 1"
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
            :default-active="$route.path"
            :collapse-transition="false"
            :unique-opened="true"
          >
            <side-menu :showIcon="true" :menuList="twoMenuList"></side-menu>
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
        :default-active="$route.path"
        :collapse-transition="false"
        :unique-opened="true"
      >
        <side-menu :showIcon="true" :menuList="menuList"></side-menu>
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

<script>
import SideMenu from "@/components/menu/SideMenu";
import DropDownMenu from "@/components/menu/DropDownMenu";
import { mapActions, mapState } from "vuex";

let that = null;
export default {
  name: "Main",
  data() {
    return {
      isCollapse: false,
      rightMenu: false,
      searchMenu: "",
      searchInput: false,
      activeMenu: {},
      menuList: [],
      twoMenuList: [],
      bran: [],
      simple: process.env.VUE_APP_SIMPLE_ONCE,
      simpleLeftMenu: localStorage.getItem("leftMenu") || "0",
    };
  },

  components: {
    SideMenu,
    DropDownMenu,
  },
  computed: {
    ...mapState({
      permissionMenuList: (state) => state.user.menuList,
    }),
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.getRouterBran();
      },
    },
  },
  created() {
    this.menuList = this.permissionMenuList;
    this.getTwoMenuList();
    if (this.bran[0]?.name != "welcome") {
      this.topLeftMenuSelect(this.bran[0]?.name);
    }
  },
  mounted() {},
  destroyed() {},
  methods: {
    getTwoMenuList() {
      let flagName = this.$route.name;
      if (flagName == "welcome") {
        if (this.menuList[0]?.children) {
          this.twoMenuList = this.menuList[0]?.children;
        }
      } else {
        this.permissionMenuList.filter((item) => {
          if (item.children.length != 0) {
            item.children.filter((key, index, originarr) => {
              if (key.name === flagName) {
                this.twoMenuList = originarr;
                return;
              }
            });
          }
          return;
        });
      }
    },
    getRouterBran() {
      let matchedFil = this.$route.matched.filter((v) => v.name);
      let arr = [];
      matchedFil.forEach((v, k) => {
        if (v.name == "dashboard") return;
        arr.push({
          name: v.name,
          path: v.path,
          title: v.meta.title,
        });
      });
      this.bran = arr;
    },
    searchInpuToggle: function () {
      that.searchInput = !that.searchInput;
    },
    searchMenuEven: function () {},
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    menuSelect(index, indexPath) {
      //此处触发动态路由被点击事件
      this.findMenuBykey(this.menuList, index);
      if (this.activeMenu.meta.isDialog) {
        let componentPath = this.activeMenu.meta.componentPath;
        let component = "";
        if (this.activeMenu.meta.isFrame) {
          component = require("@/components/layouts/IframePageView").default;
        } else {
          component = require(`@/views${componentPath}`).default;
        }
        //  打开一个弹窗
        this.dialogTitle = this.activeMenu.meta.title;
        //  打开一个弹窗
        this.$store.commit("OPEN_DIALOG", {
          _uid: "menuDialog",
          component: component,
          props: this.activeMenu.props,
        });
      } else {
        this.$router.push({ path: this.activeMenu.path });
      }
      this.$emit("dynamicRouterShow", index, this.activeMenu.meta.title);
    },
    topLeftMenuSelect(index, indexPath) {
      sessionStorage.setItem("menuIndex", index);
      const list = this.menuList.filter((item) => {
        return item.name == index;
      });
      if (!list || list.length == 0) {
        return;
      }
      if (list[0].children) {
        this.twoMenuList = list[0].children;
      } else {
        this.twoMenuList = [];
        this.$router.push(list[0].path);
      }
    },
    changeMenuType() {
      this.simpleLeftMenu = localStorage.getItem("leftMenu");
      const ind = sessionStorage.getItem("menuIndex");
      if (ind && ind != "welcome") {
        const list = this.menuList.filter((item) => {
          return item.name == ind;
        });
        if (!list || list.length == 0) {
          return;
        }
        if (list[0].children) {
          this.twoMenuList = list[0].children;
        }
      }
    },
    findMenuBykey(menus, key) {
      for (let i of menus) {
        if (i.name == key) {
          this.activeMenu = { ...i };
        } else if (i.children && i.children.length > 0) {
          this.findMenuBykey(i.children, key);
        }
      }
    },
  },
};
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
