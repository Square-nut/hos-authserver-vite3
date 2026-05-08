<template>
  <div>
    {{ result }}
  </div>
</template>
<script>
import { useUserStore } from "@/stores/user";
export default {
  data() {
    return {};
  },
  created() {
    this.logoutSystem();
  },
  mounted() {},
  methods: {
    logoutSystem() {
      //获取退出后的重定向地址
      var servceUrl = this.$route.query.service;
      //调用退出接口
      // 20240506 杨桐-----兼容老版门户退出
      useUserStore()
        .Logout()
        .then((res) => {
          //重定向到指定的地址
          location.href = servceUrl;
        })
        .catch((error) => {
          location.href = servceUrl;
        });
    },
  },
};
</script>

<style>
.welcome > div {
  margin-top: 160px;
}
</style>
