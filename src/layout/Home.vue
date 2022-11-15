<script lang="ts">
import {
  defineComponent, watch,
} from 'vue';
import { RouterView, onBeforeRouteUpdate } from 'vue-router';
import {
  NLayout, useLoadingBar, useNotification, useDialog,
} from 'naive-ui';
import { useStore } from '@/store';
import MenuBar from '@/layout/MenuBar.vue';
import UserCardDB from '@/store/db';

export default defineComponent({
  components: {
    MenuBar,
    NLayout,
    RouterView,
  },
  mounted() {
    UserCardDB.getUserCard().then((userCard) => {
      this.$store.commit('updateUserCard', userCard?.cards);
    });
    if (window.$electron?.api) {
      window.$electron?.api.on('successMessage', (event: unknown, message:string) => {
        this.notifySuccess(message);
      });
      window.$electron?.api.on('errorMessage', (event: unknown, message:string) => {
        this.notifyError(message);
      });
      window.$electron?.api.on('importUserData', (event: unknown, cards: Set<string>) => {
        this.importCardInfoDialog(new Set<string>(cards));
      });
      window.$electron?.api.loadingEnd();
    }
  },
  setup(props, context) {
    const { state, dispatch } = useStore();
    const loadingBar = useLoadingBar();
    const notification = useNotification();
    const dialog = useDialog();
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
    const notifySuccess = (message: string) => {
      notification.success({
        title: message,
        duration: 3000,
      });
    };
    const notifyError = (message: string) => {
      notification.error({
        title: message,
        duration: 5000,
      });
    };
    const notifyWarning = (message: string) => {
      notification.warning({
        title: message,
        duration: 3000,
      });
    };
    const importCardInfoDialog = (cards: Set<string>) => {
      dialog.warning({
        title: '警告,会覆盖当前数据',
        content: `确定从文件恢复幻卡库数据吗?文件中有${cards.size}条记录`,
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          dispatch('saveUserCard', cards);
        },
        onNegativeClick: () => {
          notifyWarning('已取消');
        },
      });
    };
    onBeforeRouteUpdate(() => openLoading());
    return {
      openLoading,
      closeLoading,
      notifySuccess,
      notifyError,
      notifyWarning,
      importCardInfoDialog,
    };
  },
});
</script>

<template>
  <n-layout position="absolute" style="height: 100%">
    <MenuBar />
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
