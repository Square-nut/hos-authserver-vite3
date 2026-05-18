<template>
  <div>
    <template v-for="item in menuList">
      <el-sub-menu
        :disabled="item.disabled"
        :index="item.name + ''"
        :key="item.name + ''"
        v-if="!item.hidden && item.children != null && item.children.length > 0"
        :class="[
          item.meta.oneMenu ? 'oneMenu' : 'otherMenu',
          simpleLeftMenu == 1 ? 'leftMenu' : '',
        ]"
      >
        <template #title>
          <el-icon v-if="showIcon && !item.meta.icon"><Menu /></el-icon>
          <i v-else-if="showIcon && item.meta.icon" :class="item.meta.icon"></i>
          <span :style="item.meta.oneMenu ? { color: '#fff' } : {}">{{
            item.meta.title
          }}</span>
        </template>
        <MenuTree :menuList="item.children"></MenuTree>
      </el-sub-menu>
      <el-menu-item
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
        <el-icon v-if="showIcon && !item.meta.icon"><Menu /></el-icon>
        <i v-else-if="showIcon && item.meta.icon" :class="item.meta.icon"></i>
        <template #title>
          <span>{{ item.meta.title }}</span>
        </template>
      </el-menu-item>
    </template>
  </div>
</template>

<script>
import { Menu } from '@element-plus/icons-vue';

export default {
  name: "MenuTree",
  components: { Menu },
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
.el-menu--collapse span,
.el-menu--collapse i.el-sub-menu__icon-arrow {
  height: 0;
  width: 0;
  overflow: hidden;
  visibility: hidden;
  display: inline-block;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  /* width: 200px;
    min-height: 400px;
    color: red;*/
}

.el-menu--horizontal > div > .el-sub-menu {
  float: left;
}
:deep(.el-sub-menu__icon-arrow) {
  position: relative;
  margin-top: 0;
  top: 0;
  right: -6px;
}
.leftMenu:hover,
.leftMenu > .el-sub-menu__title:hover,
.leftMenu > .el-sub-menu__title .is-active {
  /* background-color: #e5f3ff; */
  color: #339eff;
}
</style>
