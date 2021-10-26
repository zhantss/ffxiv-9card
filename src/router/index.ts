import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '@/layout/Home.vue';
import LoadingMask from '@/layout/LoadingMask.vue';
import CardAbout from '@/components/CardAbout.vue';
import CardLibrary from '@/components/CardLibrary.vue';

export default createRouter({
  // electorn support
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      components: {
        default: Home,
        LoadingMask,
      },
      children: [
        {
          path: '',
          meta: { keep: true },
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
