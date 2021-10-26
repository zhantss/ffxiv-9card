<script setup lang="ts">
import { withDefaults, defineProps, defineEmits } from 'vue';
import MenuBookRound from '@vicons/material/MenuBookRound';
import type { Card } from '@/types';

interface Props {
  card: Card,
  type?: string,
}
withDefaults(defineProps<Props>(), {
  type: 'info',
});
// eslint-disable-next-line no-unused-vars
const emit = defineEmits<{(e: 'openWiki', url: string): void}>();
const open = (url: string) => {
  emit('openWiki', url);
};
</script>

<template>
  <n-button
    class="wiki-btn" size="small"
    :type="type" dashed @click="open(card.wiki)">
      <template #icon>
        <n-icon>
          <menu-book-round />
        </n-icon>
      </template>
        {{ card.name }}
      </n-button>
</template>
