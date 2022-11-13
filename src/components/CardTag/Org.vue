<script setup lang="ts">
defineProps({
  org: String,
});
</script>

<template>
  <n-tag v-if="org !== 'none'" type="success">
    {{ org }}
  </n-tag>
</template>

<style scoped lang="scss">
.n-tag {
  width: 56px;
  justify-content: center;
}
</style>
