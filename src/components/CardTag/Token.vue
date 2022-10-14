<script setup lang="ts">
import { withDefaults, defineProps } from 'vue';

interface Props {
  name: string
  type: string
  pos: {
    id: number,
    x: string,
    y: string,
    desc: string
  }
  npc: string
  value: string
}
withDefaults(defineProps<Props>(), {});

const openMap = (id: number, x: string, y: string) => {
  if (window.$electron?.api) {
    window.$electron?.api.openMap(id, x, y);
  }
  // TODO 警告
};
</script>

<template>
  <span class="card-acq">
    <n-button class="map-name" text @click="openMap(pos.id, pos.x, pos.y)">{{ pos.desc }}</n-button>
    {{ npc }} {{ value }}
    <n-avatar
        :size="14"
        :style="{
          '--color': 'rgba(255,255,255,0)',
          backgroundColor: 'rgba(255,255,255,0)',
        }"
        :class="'acq-token'"
        :src="'./card/' + type + '.png'"
      />
    {{ name }} 购买
  </span>
</template>

<style scoped lang="scss">
.card-acq {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
.map-name {
  color: #77d1ff;
  margin-right: 5px;
}

.acq-token {
  margin-left: 5px;
  margin-right: 2px;
}
.map-name::before {
  content: "";
  background: url('../card/map-marked.png') no-repeat 0 0;
  background-size: cover;
  display: inline-block;
  height: 16px;
  width: 16px;
  margin-left: 2px;
  margin-right: 2px;
}
</style>
