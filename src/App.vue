<script lang="ts">
import { defineComponent, computed } from 'vue';
import { RouterView } from 'vue-router';
import { useStore } from '@/store';

export default defineComponent({
  components: {
    RouterView,
  },
  setup() {
    const { state, commit } = useStore();
    const loading = computed(() => state.loading);
    const setLoading = (l: boolean) => {
      commit('loading', l);
    };
    return {
      loading,
      setLoading,
    };
  },
});

</script>

<template>
  <n-notification-provider>
    <n-loading-bar-provider>
      <router-view v-slot="{ Component }" name="LoadingMask">
          <transition name="fade">
            <component v-if="loading" :is="Component" />
          </transition>
        </router-view>
      <router-view @loading="setLoading"></router-view>
    </n-loading-bar-provider>
  </n-notification-provider>
</template>

<style lang="scss">
html, body {
  height: 100%;
}
#app {
  height: 100%;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
