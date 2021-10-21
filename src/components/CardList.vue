<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { useStore } from 'vuex';
import CardData from '@/assets/ffxiv-9card.json';
import Card from './Card.vue';

export default defineComponent({
  components: {
    Card,
  },
  setup() {
    const { state } = useStore();
    const { loading } = toRefs(state);
    const data = CardData.sort(
      (a, b) => {
        const posa = a.pos == null ? '0' : a.pos;
        const posb = b.pos == null ? '0' : b.pos;
        return Number.parseInt(posa, 10) - Number.parseInt(posb, 10);
      },
    );
    return {
      data,
      loading,
    };
  },
});
</script>

<template>
  <n-space vertical v-if="!loading">
    <Card v-for="card in data" :key="card?.pos" :card="card" />
  </n-space>
  <n-space vertical v-else>
    <n-card
      v-for="(v, i) in [1,2,3,4]"
      :class="'card-box-loading'"
      :style="{
        'text-align': 'left'
      }"
      :key="i" content-style="padding: 20px 15px;">
      <n-thing>
        <template #header>
          <n-skeleton :width="120" size="medium" :repeat="2" />
        </template>
        <n-skeleton text :width="'80%'" :repeat="3" />
      </n-thing>
    </n-card>
  </n-space>
</template>

<style lang="scss">
.card-box-loading {
  min-width: 1000px;
}
</style>
