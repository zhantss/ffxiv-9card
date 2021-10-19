import { createApp } from 'vue';
import {
  create,
  NButton,
} from 'naive-ui';
import App from '@/App.vue';

import router from './router/index';
import store from './store/index';

const app = createApp(App);
const naive = create({
  components: [NButton],
});
app.use(naive);
app.use(router);
app.use(store);
app.mount('#app');
