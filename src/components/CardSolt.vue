<script setup lang="ts">
import {
  defineProps, withDefaults, defineEmits, computed,
} from 'vue';
import { Card } from '@/types';

interface Props {
  card: Card,
  has: boolean,
  size?: number
  showId?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  has: false,
  size: 44,
  showId: false,
});

// eslint-disable-next-line no-unused-vars
const emits = defineEmits<{(e: 'chose', id: string | undefined): void}>();

const thisChose = (id: string | undefined) => {
  emits('chose', id);
};
const noCardStyle = computed(() => ({
  height: `${props.size}px`,
  width: `${props.size}px`,
}));
</script>

<template>
  <div class="card-box"
    :data-id="card?.id" @click="thisChose(card?.id)">
    <div
      :style="noCardStyle"
      class="no-card"
      v-if="has"></div>
    <n-avatar
    :size="size" class="card-icon"
    :style="{
      '--color': 'rgba(255,255,255,0)',
    }"
    :src="`./ffxiv/icon/${card?.icon}`" />
  </div>
</template>

<style lang="scss" scoped>
.card-box {
  border: 2px solid #77552d;
  display: inline-flex;
  position: relative;
  cursor: pointer;
  .no-card {
    display: inline-block;
    position: absolute;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.6);
  }
}
</style>
