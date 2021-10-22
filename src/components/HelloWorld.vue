<script lang="ts">
import { defineComponent } from 'vue';
import { useNotification } from 'naive-ui';
import { useStore } from '@/store';

export default defineComponent({
  props: {
    msg: String,
  },
  setup() {
    const store = useStore();
    const notification = useNotification();
    if (window.$electron?.api) {
      window.$electron?.api.on('errorMessage', (event: Event, msg: string) => {
        notification.error({
          title: 'Error!',
          content: msg,
          meta: new Date().toString(),
          duration: 5000,
        });
      });
      window.$electron?.api.on('successMessage', (event: Event, msg: string) => {
        notification.success({
          title: 'ok',
          content: msg,
          meta: new Date().toString(),
          duration: 5000,
        });
      });
      window.$electron?.api.on('importUserData', (event: Event, userData: Record<string, boolean>) => {
        store.dispatch('saveUserData', userData);
        notification.success({
          title: 'ok',
          content: '导入成功',
          meta: new Date().toString(),
          duration: 5000,
        });
      });
    }
    return {
    };
  },
});
</script>

<template>
  <n-space justify="center">
    <n-avatar alt="ffxiv 9card logo" :size="64" src='./9card.png' />
  <span class="tool-title">{{ msg }}</span>
  </n-space>
</template>

<style scoped>
.tool-title {
  font-size: 32px;
  margin: 5px;
  display: inline-block;
}
</style>
