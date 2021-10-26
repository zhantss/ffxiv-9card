<script lang="ts">
import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';

export default defineComponent({
  components: {
    RouterView,
  },
  setup() {
    return {};
  },
});

</script>

<template>
  <n-notification-provider>
    <router-view></router-view>
  </n-notification-provider>
</template>

<style lang="scss">
html, body {
  height: 100%;
}
#app {
  height: 100%;
}
</style>
