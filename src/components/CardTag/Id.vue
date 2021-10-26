<script setup lang="ts">
import { defineProps, computed } from 'vue';

const props = defineProps({
  cardId: String,
});
const id = computed(() => (props.cardId?.startsWith('编号外') ? props.cardId : `编号 ${props.cardId}`));
</script>

<template>
  <n-tag type="info">
    {{ id }}
  </n-tag>
</template>
