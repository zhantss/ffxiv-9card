<script setup lang="ts">
import { withDefaults, defineProps, defineEmits } from 'vue';

interface Props {
  taskType: string;
  taskName: string;
  type?: string;
}
withDefaults(defineProps<Props>(), {
  type: 'info',
});
// eslint-disable-next-line no-unused-vars
const emit = defineEmits<{(e: 'openWiki', url: string): void }>();
const open = (url: string) => {
  emit('openWiki', url);
};
const takUrl = (taskName: string) => `https://ff14.huijiwiki.com/wiki/${encodeURIComponent(`任务:${taskName}`)}`;
</script>

<template>
  <n-button class="wiki-btn" size="small" :type="type" dashed @click="open(takUrl(taskName))">
    <template #icon>
      <n-avatar
        :size="18"
        :style="{
          '--color': 'rgba(255,255,255,0)',
          backgroundColor: 'rgba(255,255,255,0)',
        }"
        :class="'rarity'"
        :src="'./card/task_' + taskType + '.png'"
      />
    </template>
    {{ taskName }}
  </n-button>
</template>
