<template>
  <div>
    <template v-for="item in menuList">
      <hos-submenu
        :disabled="item.disabled"
        :index="item.name + ''"
        :key="item.name + ''"
        v-if="!item.hidden && item.children != null && item.children.length > 0"
        :class="[
          item.meta.oneMenu ? 'oneMenu' : 'otherMenu',
          simpleLeftMenu == 1 ? 'leftMenu' : '',
        ]"
      >
        <template slot="title">
          <i
            v-if="showIcon"
            :class="item.meta.icon ? item.meta.icon : 'hos-icon-menu'"
          ></i>
          <span
            slot="title"
            :style="item.meta.oneMenu ? { color: '#fff' } : {}"
            >{{ item.meta.title }}</span
          >
        </template>
        <MenuTree :menuList="item.children"></MenuTree>
      </hos-submenu>
      <hos-menu-item
        v-else-if="!item.hidden"
        :disabled="item.disabled"
        :index="item.name + ''"
        :route="item.path + ''"
        :key="item.name"
        :class="[
          item.meta.oneMenu ? 'oneMenu no-child-onemenu' : 'otherMenu',
          simpleLeftMenu == 1 ? 'leftMenu' : '',
        ]"
      >
        <i v-if="showIcon" :class="item.meta.icon ? item.meta.icon : 'hos-icon-menu'"></i>
        <span slot="title">{{ item.meta.title }}</span>
      </hos-menu-item>
    </template>
  </div>
</template>

<script>
export default {
  name: "MenuTree",
  data() {
    return {
      simpleLeftMenu: localStorage.getItem("leftMenu"),
    };
  },
  props: ["menuList", "showIcon"],
  methods: {
  },
};
</script>

<style scoped>
/*实现了一个溢出处理*/
.hos-menu--collapse span,
.hos-menu--collapse i.hos-submenu__icon-arrow {
  height: 0;
  width: 0;
  overflow: hidden;
  visibility: hidden;
  display: inline-block;
}
.hos-menu-vertical-demo:not(.hos-menu--collapse) {
  /* width: 200px;
    min-height: 400px;
    color: red;*/
}

.hos-menu--horizontal > div > .hos-submenu {
  float: left;
}
::v-deep .hos-submenu__icon-arrow {
  position: relative;
  margin-top: 0;
  top: 0;
  right: -6px;
}
.leftMenu:hover,
.leftMenu > .hos-submenu__title:hover,
.leftMenu > .hos-submenu__title .is-active {
  /* background-color: #e5f3ff; */
  color: #339eff;
}
</style>
