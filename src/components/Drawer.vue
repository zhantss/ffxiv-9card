<script lang="ts">
import {
  defineComponent, PropType,
} from 'vue';
import { Card } from '@/types';

export default defineComponent({
  props: {
    drawer: Object as PropType<Array<Card>>,
  },
  data() {
    return {
      userData: { ...this.$store.state.userData },
    };
  },
  computed: {
    lines() {
      const lines = [];
      if (this.drawer != null) {
        for (let i = 0; i < this.drawer?.length; i += 5) {
          lines.push(this.drawer?.slice(i, i + 5));
        }
      }
      return lines;
    },
  },
  methods: {
    markCard(event: any) {
      if (event.currentTarget && event.currentTarget.dataset) {
        const { cardId } = event.currentTarget.dataset;
        if (!cardId) {
          return;
        }
        if (this.userData[cardId]) {
          this.userData[cardId] = false;
        } else {
          this.userData[cardId] = true;
        }
        this.$emit('updateUserDate', this.userData);
      }
    },
  },
  setup() {
    return {};
  },
});

</script>

<template>
  <n-space vertical>
    <div class="card-drawer-line" v-for="(line, i) in lines" :key="i">
      <div
        class="card-selection"
        v-for="(card, cnum) in line"
        @click="markCard" :data-card-id="card.id" :key="cnum">
        <div class="no-card" v-if="!userData[card.id]"></div>
        <n-avatar
        :size="44" class="drawer-cell"
        :style="{
          '--color': 'rgba(255,255,255,0)',
        }"
        :src="`/ffxiv/icon/${card.icon}`" />
      </div>
    </div>
  </n-space>
</template>

<style lang="scss">
.card-selection {
  border: 2px solid #77552D;
  display: inline-flex;
  position: relative;
  cursor: pointer;
  margin-right: 2px;
  .no-card {
    display: inline-block;
    position: absolute;
    height: 44px;
    width: 44px;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.6);
  }
}
</style>
