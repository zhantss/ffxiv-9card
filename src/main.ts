import { createApp } from 'vue';
import {
  create,
  NSkeleton,
  NGrid,
  NGridItem,
  NThing,
  NAvatar,
  NTag,
  NSpace,
  NButton,
  NIcon,
  NSwitch,
  NCard,
  NImage,
} from 'naive-ui';
import App from '@/App.vue';

import router from './router/index';
import store from './store/index';

const app = createApp(App);
if (window.$electron?.ipcRenderer) {
  app.config.globalProperties.$loadUserCard = async () => {
    store.commit('loading', true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.$electron.ipcRenderer.invoke('getStoreValue', 'card').then((value: any) => {
      app.config.globalProperties.$userCard = value;
      console.log('loading user card data ok');
      store.commit('loading', false);
    });
  };
} else {
  store.commit('loading', false);
}
const naive = create({
  components: [
    NSkeleton, NGrid, NGridItem, NThing,
    NAvatar, NTag, NSpace, NButton, NIcon, NSwitch, NCard, NImage],
});
app.use(naive);
app.use(router);
app.use(store);
app.mount('#app');
