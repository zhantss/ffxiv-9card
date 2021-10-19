import { createRouter, createWebHashHistory } from 'vue-router';
import HelloWorld from '@/components/HelloWorld.vue';

export default createRouter({
  // electorn support
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HelloWorld,
    },
  ],
});
