<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  patch: String,
});
const cardPatch = computed(() => (props.patch?.length === 1 ? `${props.patch}.0` : `${props.patch}`));
</script>

<template>
  <n-tag type="success" round class="card-tag-patch">
    {{ cardPatch }}
  </n-tag>
</template>

<style scoped lang="scss">
.n-tag {
  width: 56px;
  justify-content: center;
}
</style>
