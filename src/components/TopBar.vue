<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const exportCardInfo = () => {
      if (window.$electron?.ipcRenderer) {
        window.$electron.ipcRenderer.invoke('exportCardInfo');
      }
    };
    return {
      exportCardInfo,
    };
  },
});
</script>

<template>
  <n-space class="card-bar">
    <n-button type="primary" @click="exportCardInfo">导出卡片配置</n-button>
  </n-space>
</template>

<style lang="scss">
.card-bar {
  padding: 10px 15px;
}
</style>
