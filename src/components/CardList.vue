<script lang="ts">
import {
  defineComponent, toRefs,
} from 'vue';
import { useStore } from '@/store';
import CardUI from '@/components/Card.vue';
import TopBar from '@/components/TopBar.vue';

export default defineComponent({
  components: {
    CardUI,
    TopBar,
  },
  computed: {
    data() {
      const { state } = useStore();
      const { cardData } = state;
      return cardData.sort(
        (a, b) => {
          const posa = a.pos == null ? '0' : a.pos;
          const posb = b.pos == null ? '0' : b.pos;
          return Number.parseInt(posa, 10) - Number.parseInt(posb, 10);
        },
      );
    },
  },
  setup() {
    const { state } = useStore();
    const { loading } = toRefs(state);
    return {
      loading,
    };
  },
});
</script>

<template>
  <n-space vertical v-if="!loading" style='max-width: 980px'>
    <TopBar />
    <CardUI v-for="card in data" :key="card?.pos" :card="card" />
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

<style lang="scss" scoped>
.card-box-loading {
  min-width: 980px;
  max-width: 980px;
}
</style>
