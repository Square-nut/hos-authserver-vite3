<template>
  <div>
    <iframe class="license-iframe" frameborder="0" :src="iframeUrl"></iframe>
  </div>
</template>
<script setup lang="ts">
defineProps<{
	iframeUrl?: string
}>()
</script>
<style lang="scss" scoped>
.license-iframe{
  width: 100%;
  padding:0 20px;
  box-sizing: border-box;
  height: 235px;
}
</style>
