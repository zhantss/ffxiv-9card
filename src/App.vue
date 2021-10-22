<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import {
  getCurrentInstance, onMounted,
} from 'vue';
import { useStore } from '@/store';
import HelloWorld from '@/components/HelloWorld.vue';
import CardList from '@/components/CardList.vue';
import CardData from '@/assets/ffxiv-9card.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { proxy }: any = getCurrentInstance();
onMounted(() => {
  // push cardData to Store
  const store = useStore();
  store.commit('pushCardData', CardData);
  if (proxy && proxy.$loadUserCard) {
    proxy.$loadUserCard();
  }
});
</script>

<template>
  <n-notification-provider>
    <HelloWorld msg="FFXIV 九宫幻卡工具"/>
  </n-notification-provider>
    <n-space justify="space-around" class="main-box">
      <CardList />
    </n-space>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
