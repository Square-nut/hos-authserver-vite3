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
          <hos-dropdown-menu slot="dropdown">
            <hos-dropdown-item command="closeAll">关闭全部</hos-dropdown-item>
            <hos-dropdown-item command="closeOthers"
            >关闭其它</hos-dropdown-item
            >
          </hos-dropdown-menu>
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
<script>
import GlobalLayout from "@/components/page/GlobleLayout";
import RouteView from "@/components/layouts/RouteView";

const welcomeKey = "welcome";
export default {
  name: "TabLayout",
  components: {
    GlobalLayout,
    RouteView,
  },
  data() {
    return {
      pageList: [],
      linkList: [],
      activePage: "",
      multipage: true,
      showMenu: true,
    };
  },
  watch: {
    $route: function (newRoute) {
     //页面跳转标题的拼接
      const newPage = Object.assign({}, newRoute)
      newPage.meta = Object.assign({}, newRoute.meta)
      this.activePage = newPage.name;
      if (!this.multipage) {
        this.linkList = [newPage.name];
        this.pageList = [Object.assign({}, newPage)];
      } else if (this.linkList.indexOf(newPage.name) < 0) {
        if(newPage.query.title){
          newPage.meta.title= newPage.query.title + "-" +newPage.meta.title;
        }
        this.linkList.push(newPage.name);
        this.pageList.push(newPage);
      } else if (this.linkList.indexOf(newPage.name) >= 0) {
        let oldIndex = this.linkList.indexOf(newPage.name);
        // let oldPositionRoute = this.pageList[oldIndex];
        if(newPage.query.title){
          newPage.meta.title= newPage.query.title + "-" +newPage.meta.title;
        }
        // newPage.meta = oldPositionRoute.meta;
        this.pageList.splice(
          oldIndex,
          1,
          newPage
        );
      }
    },
    activePage: function (key) {
      for (let page of this.pageList) {
        if (page.name === key) {
          this.$router.push(Object.assign({}, page));
        }
      }
    },
  },
  provide() {
    return {
      closeCurrent: this.closeCurrent,
    };
  },
  computed: {
    keepAlive() {
      return this.$route.meta.keepAlive;
    },
  },
  created() {
    if (this.$route.name != welcomeKey) {
      this.addIndexToFirst();
    }
    // 复制一个route对象出来，不能影响原route
    let currentRoute = Object.assign({}, this.$route);
    currentRoute.meta = Object.assign({}, currentRoute.meta);
    this.pageList.push(currentRoute);
    this.linkList.push(currentRoute.name);
    this.activePage = currentRoute.name;
    if(this.$route.query.showMenu){
      this.showMenu = this.$route.query.showMenu == 'true' ? true : false;
    }
  },
  methods: {
    // 将首页添加到第一位
    addIndexToFirst() {
      this.pageList.splice(0, 0, {
        name: welcomeKey,
        path: "/main/welcome",
        fullPath: "/main/welcome",
        meta: {
          icon: "dashboard",
          title: "首页",
        },
      });
      this.linkList.splice(0, 0, welcomeKey);
    },

    dynamicRouterShow(key, title) {
      console.log("--------dynamicRouterShow--------")
      // let keyIndex = this.linkList.indexOf(key);
      // if (keyIndex >= 0) {
      //   let currRouter = this.pageList[keyIndex];
      //   let meta = Object.assign({}, currRouter.meta, { title: title });
      //   this.pageList.splice(
      //     keyIndex,
      //     1,
      //     Object.assign({}, currRouter, { meta: meta })
      //   );
        // if (key === this.activePage) {
        //   this.changeTitle(title)
        // }
      // }
    },
    changePage(key) {
      this.activePage = key.name;
    },
    removePage(key) {
      if (key == welcomeKey) {
        this.$message.warning("首页不能关闭!");
        return;
      }
      if (this.pageList.length === 1) {
        this.$message.warning("这是最后一页，不能再关闭了啦");
        return;
      }
      // let removeRoute = this.pageList.filter(item => item.name == key)
      this.pageList = this.pageList.filter((item) => item.name !== key);
      let index = this.linkList.indexOf(key);
      this.linkList = this.linkList.filter((item) => item !== key);
      index = index >= this.linkList.length ? this.linkList.length - 1 : index;
      this.activePage = this.linkList[index];
    },
    closeCommand(command) {
      switch (command) {
        case "closeAll":
          this.closeAll();
          break;
        case "closeOthers":
          this.closeOthers();
          break;
        default:
          break;
      }
    },
    closeAll() {
      this.pageList.splice(1, this.pageList.length - 1);
      this.linkList.splice(1, this.linkList.length - 1);
      this.activePage = this.linkList[0];
    },
    closeOthers() {
      let index = this.linkList.indexOf(this.activePage);
      if (this.activePage == welcomeKey) {
        this.linkList = this.linkList.slice(index, index + 1);
        this.pageList = this.pageList.slice(index, index + 1);
        this.activePage = this.linkList[0];
      } else {
        let indexContent = this.pageList.slice(0, 1)[0];
        this.linkList = this.linkList.slice(index, index + 1);
        this.pageList = this.pageList.slice(index, index + 1);
        this.linkList.unshift(indexContent.name);
        this.pageList.unshift(indexContent);
        this.activePage = this.linkList[1];
      }
    },
    closeCurrent() {
      this.removePage(this.activePage);
    },
    // changeTitle(title) {
    //   let projectTitle = "HOS Mediway"
    //   // 首页特殊处理
    //   if (this.$route.path === welcomeKey) {
    //     document.title = projectTitle
    //   } else {
    //     document.title = title + ' · ' + projectTitle
    //   }
    // },
  },
};
</script>
<style scoped lang="scss">
.calc-sign{
  margin: 11px;
  height: calc(100% - 60px);
}
</style>
