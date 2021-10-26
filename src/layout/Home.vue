<script lang="ts">
import {
  defineComponent, watch,
} from 'vue';
import { RouterView, onBeforeRouteUpdate } from 'vue-router';
import { NLayout, useLoadingBar } from 'naive-ui';
import { useStore } from '@/store';
import Menu from '@/layout/Menu.vue';
import UserCardDB from '@/store/db';

export default defineComponent({
  components: {
    Menu,
    NLayout,
    RouterView,
  },
  mounted() {
    UserCardDB.getUserCard().then((userCard) => {
      this.$store.commit('updateUserCard', userCard?.cards);
    });
    if (window.$electron?.api) {
      window.$electron?.api.loadingEnd();
    }
  },
  setup(props, context) {
    const { state } = useStore();
    const loadingBar = useLoadingBar();
    watch(
      () => state.loading,
      (loading) => {
        if (loading === true) {
          loadingBar.start();
        } else {
          loadingBar.finish();
        }
      },
    );
    const openLoading = () => {
      context.emit('loading', true);
    };
    const closeLoading = () => {
      context.emit('loading', false);
    };
    onBeforeRouteUpdate(() => openLoading());
    return {
      openLoading,
      closeLoading,
    };
  },
});
</script>

<template>
  <n-layout position="absolute" style="height: 100%">
    <Menu />
    <n-layout has-sider position="absolute" style="top: 50px">
      <router-view
          @vnode-updated="closeLoading"
          @vnode-mounted="closeLoading"
          v-slot="{ Component }" >
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
      </router-view>
    </n-layout>
  </n-layout>
</template>
