<script lang="ts">
import { defineComponent } from 'vue';
import CardData from '@/assets/ffxiv-9card.json';
import Card from './Card.vue';

export default defineComponent({
  components: {
    Card,
  },
  setup() {
    const data = CardData.sort(
      (a, b) => {
        const posa = a.pos == null ? '0' : a.pos;
        const posb = b.pos == null ? '0' : b.pos;
        return Number.parseInt(posa, 10) - Number.parseInt(posb, 10);
      },
    );
    return {
      data,
    };
  },
});
</script>

<template>
  <n-space vertical>
    <Card v-for="card in data" :key="card?.pos" :card="card" />
  </n-space>
</template>
