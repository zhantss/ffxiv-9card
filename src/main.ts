import { createApp } from 'vue';
import {
  create,
  NThing,
  NAvatar,
  NTag,
  NSpace,
  NButton,
  NIcon,
  NCheckbox,
  NSwitch,
  NCard,
  NImage,
} from 'naive-ui';
import App from '@/App.vue';

import router from './router/index';
import store from './store/index';

const app = createApp(App);
const naive = create({
  components: [NThing, NAvatar, NTag, NSpace, NButton, NIcon, NCheckbox, NSwitch, NCard, NImage],
});
app.use(naive);
app.use(router);
app.use(store);
app.mount('#app');
