<template>
  <div class="simple-login-feature">
    <div class="feature-item" v-for="(feat, index) in data" :key="'feat-'+index">
      <template v-for="(item, ind) in feat">
        <div class="feature-item-header" :key="'head-'+ind" v-if="item.type == 'Title' && item.actived == true">
          <img :src="item.content.login_back_file_id" alt="" class="dib mid" />
          <span class="dib mid">{{ item.title }}</span>
        </div>
        <p class="feature-item-body" v-if="item.type == 'Desc' && item.actived == true" :key="'body-'+ind">{{ item.content }}</p>
        <img class="feature-single-img" v-if="item.type == 'Icon' && item.actived == true" :key="'img-'+ind" alt="" :src="item.content.login_back_file_id">
      </template>
     
    </div>
    <!-- <div class="feature-item">
      <div class="feature-item-header">
        <img src="../assets/features/feat2.png" alt="" class="dib mid" />
        <span class="dib mid">{{ $t('一站式平台') }}</span>
      </div>
      <p class="feature-item-body" >{{ $t('聚集应用') }}</p>
      <p class="feature-item-body" >{{ $t('梳理业务流程') }}</p>
      <p class="feature-item-body" >{{ $t('信息驱动工作') }}</p>
    </div>
    <div class="feature-item">
      <div class="feature-item-header">
        <img src="../assets/features/feat3.png" alt="" class="dib mid" />
        <span class="dib mid">{{ $t('B2E个人热点') }}</span>
      </div>
      <p class="feature-item-body" >{{ $t('我的资质档案') }}</p>
      <p class="feature-item-body" >{{ $t('工资条、绩效指标') }}</p>
      <p class="feature-item-body" >{{ $t('企业即时消息') }}</p>
    </div>
    <div class="feature-item">
      <div class="feature-item-header">
        <img src="../assets/features/feat4.png" alt="" class="dib mid" />
        <span class="dib mid">{{ $t('医生工作站') }}</span>
      </div>
      <p class="feature-item-body" >{{ $t('医生秘书') }}</p>
      <p class="feature-item-body" >{{ $t('临床指南+临床路径') }}</p>
      <p class="feature-item-body" >{{ $t('电子病历') }}</p>
    </div> -->
  </div>
</template>
<script>

export default {
  props: ['data'],
  components: {},
  data() {
    return {
    }
  },
  created() {

  },
  methods: {
  }
}
</script>
<style lang='scss' scoped>

</style>
<style lang='scss'>
</style>