<script setup lang="ts">
import { withDefaults, defineProps } from 'vue';
import { useRouter } from 'vue-router';
import TaskWiki from './Task.vue';

interface Props {
  name: string;
  pos: string;
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
</script>

<template>
  <span>
    与{{ pos }}的
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
.npc-name {
  color: #77d1ff;
}
.npc-prep::after {
  content: "!";
  color: brown;
  font-weight:bold;
  margin-left: 2px;
}
</style>
