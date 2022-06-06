<script setup lang="ts">
import { computed, h } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import {
  NIcon, NMenu, NLayoutHeader,
} from 'naive-ui';
import { AllInclusiveRound } from '@vicons/material';
import { useStore } from '@/store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderIcon = (icon: any) => () => h(NIcon, null, { default: () => h(icon) });

const { state } = useStore();
const route = useRoute();
const { cardExt } = state;
const ext = computed(() => {
  const param = route.params.ext;
  if (param) {
    return param.toString();
  }
  return 'all';
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const options: any = [];
const menus: Record<string, string> = cardExt.menu;
const keys = Object.keys(menus);
keys.forEach((key) => {
  options.push({
    key,
    icon: renderIcon(AllInclusiveRound),
    label: () => h(
      RouterLink,
      {
        to: {
          path: key !== 'all' ? `/about/${key}` : '/',
        },
      },
      { default: () => menus[key] },
    ),
  });
});

</script>

<template>
  <n-layout-header bordered>
    <n-space class="app-header" justify="space-between">
      <n-menu
      mode="horizontal"
      :options="options"
      :value="ext" />
    </n-space>
  </n-layout-header>
</template>

<style lang="scss">
.app-header {
  padding: 0 50px;
}
</style>
