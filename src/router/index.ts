import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '@/layout/Home.vue';
import CardLibrary from '@/components/CardLibrary.vue';
import CardAbout from '@/components/CardAbout.vue';

export default createRouter({
  // electorn support
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      children: [
        {
          path: '',
          component: CardLibrary,
        },
        {
          path: 'about/:ext/:and?',
          component: CardAbout,
        },
      ],
    },
  ],
});
