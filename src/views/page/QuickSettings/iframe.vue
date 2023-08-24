<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

defineOptions({
  name: "Yiframe"
});
let frameSrc = ref('');
// 使用 onMounted 钩子函数获取路由参数
onMounted(() => {
  const route = useRoute();
  const url = ref<string>(route.query.url as string);
  frameSrc.value = url.value;
});
</script>

<template>
  <div class="frame">
    <iframe :src="frameSrc" class="frame-iframe" ref="frameRef" />
  </div>
</template>

<style lang="scss" scoped>
.frame {
  margin: 0;
  padding: 0;
  z-index: 998;
  height: calc(100vh - 88px);
  display: flex;
  /* 设置 display 为 flex */
  align-items: flex-start;
  /* 垂直对齐内容到上方 */

  .frame-iframe {
    border: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }
}
</style>