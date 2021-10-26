<script lang="ts">
import { defineComponent } from 'vue';
import { NLayout } from 'naive-ui';
import { RouterView } from 'vue-router';
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
  },
  setup() {
    return {};
  },
});
</script>

<template>
  <n-layout position="absolute" style="height: 100%">
    <Menu />
    <n-layout has-sider position="absolute" style="top: 60px">
      <router-view></router-view>
    </n-layout>
  </n-layout>
</template>
