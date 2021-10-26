import { createApp } from 'vue';
import { Store } from 'vuex';
import {
  create,
  NSkeleton,
  NGrid,
  NGridItem,
  NModal,
  NThing,
  NPagination,
  NAvatar,
  NTag,
  NSpace,
  NButtonGroup,
  NButton,
  NIcon,
  NSwitch,
  NImage,
  NNotificationProvider,
  NPopconfirm,
} from 'naive-ui';
import App from '@/App.vue';

import router from './router/index';
import store, { State, storeKey } from './store/index';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<State>
    $userCard: Record<string, boolean>
  }
}

const app = createApp(App);
if (window.$electron?.api) {
  app.config.globalProperties.$loadUserCard = async () => {
    store.commit('loading', true);
    window.$electron?.api.getStoreValue('card').then((value: Record<string, boolean>) => {
      app.config.globalProperties.$userCard = value;
      store.commit('pushUserData', value);
      store.commit('loading', false);
      console.log('loading user card data ok');
    });
  };
} else {
  store.commit('loading', false);
}
const naive = create({
  components: [NNotificationProvider, NPopconfirm,
    NSkeleton, NGrid, NGridItem, NThing, NModal, NPagination, NButtonGroup,
    NAvatar, NTag, NSpace, NButton, NIcon, NSwitch, NImage],
});
app.use(naive);
app.use(router);
app.use(store, storeKey);
app.mount('#app');
