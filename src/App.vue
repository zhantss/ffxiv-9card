<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import {
  getCurrentInstance, onMounted,
} from 'vue';
import HelloWorld from '@/components/HelloWorld.vue';
import CardList from '@/components/CardList.vue';

const { proxy }: any = getCurrentInstance();
onMounted(() => {
  if (proxy && proxy.$loadUserCard) {
    proxy.$loadUserCard();
  }
});
</script>

<template>
  <n-image alt="ffxiv 9card logo" height="128" width="128" src='./9card.png' />
  <HelloWorld msg="FFXIV 九宫幻卡工具"/>
  <n-space justify="space-around">
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
