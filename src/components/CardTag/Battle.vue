<script setup lang="ts">
import { withDefaults, defineProps } from 'vue';
import { useRouter } from 'vue-router';
import TaskWiki from './Task.vue';

interface Props {
  name: string;
  pos: {
    id: number,
    x: string,
    y: string,
    desc: string
  };
  prep?: {
    conj?: string;
    type: string;
    name: string;
  }[];
}
withDefaults(defineProps<Props>(), {});
const router = useRouter();
const openUrl = (url: string) => {
  if (window.$electron?.api) {
    window.$electron?.api.openUrl(url);
  } else {
    window.open(url);
  }
};
const toNpcPage = (name: string) => {
  router.push({
    path: `/about/npc/${name}`,
  });
};
const openMap = (id: number, x: string, y: string) => {
  if (window.$electron?.api) {
    window.$electron?.api.openMap(id, x, y);
  }
  // TODO 警告
};
</script>

<template>
  <span class="card-acq">
    与
    <n-button class="map-name" text @click="openMap(pos.id, pos.x, pos.y)">{{ pos.desc }}</n-button>
    的
    <n-popover trigger="hover" v-if="prep?.length">
      <template #trigger>
        <n-button class="npc-name npc-prep" text @click="toNpcPage(name)">{{ name }}</n-button>
      </template>
      <n-space vertical>
        <TaskWiki
          v-for="(task, i) in prep"
          :key="i"
          :task-type="task.type"
          :task-name="task.name"
          @open-wiki="openUrl"
        />
      </n-space>
    </n-popover>
    <n-button v-else class="npc-name" text @click="toNpcPage(name)">{{ name }}</n-button>
    进行幻卡对战
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
.npc-name {
  color: #77d1ff;
  margin-left: 5px;
  margin-right: 5px;
}
.npc-prep::after {
  content: "!";
  color: brown;
  font-weight:bold;
  margin-left: 2px;
}
.map-name::before {
  content: "";
  background: url('../card/map-marked.png') no-repeat 0 0;
  background-size: cover;
  display: inline-block;
  height: 14px;
  width: 14px;
  margin-left: 2px;
  margin-right: 2px;
}
</style>
