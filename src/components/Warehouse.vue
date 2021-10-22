<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { useStore } from '@/store';
import Drawer from '@/components/Drawer.vue';

export default defineComponent({
  components: {
    Drawer,
  },
  props: {
    no: Number,
  },
  computed: {
    drawers() {
      const { state } = useStore();
      const { cardData } = toRefs(state);
      const drawers = [];
      const data = cardData.value.filter((card) => !card.id.startsWith('编号外'));
      const after = cardData.value.filter((card) => card.id.startsWith('编号外'));
      for (let i = 0; i < data.length; i += 30) {
        drawers.push(data.slice(i, i + 30));
      }
      drawers.push(after);
      return drawers;
    },
    number() {
      const num = this.no ? this.no : 1;
      return (num - 1) * 3;
    },
  },
  methods: {
    updateUserDate(userData: Record<string, boolean>) {
      this.$emit('updateUserData', userData);
    },
  },
  setup() {
    return {
    };
  },
});

</script>

<template>
  <n-grid :cols="3">
    <n-gi v-for="(drawer, i) in drawers.slice(number, number + 3)" :key="i">
      <Drawer @updateUserDate="updateUserDate" :drawer="drawer" />
    </n-gi>
  </n-grid>
</template>
