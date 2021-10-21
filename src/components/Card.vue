<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import MenuBookOutlined from '@vicons/material/MenuBookOutlined';
import { Card } from '../types';

export default defineComponent({
  components: {
    MenuBookOutlined,
  },
  props: {
    card: { type: Object as PropType<Card>, require: true },
  },
  methods: {
    openWiki(url?: string) {
      window.open(url);
    },
  },
  setup(props) {
    if (props.card == null) {
      return {
        empty: true,
      };
    }
    // eslint-disable-next-line vue/no-setup-props-destructure
    const {
      id, name, rarity, org, patch, values, acqs, icon, surface, haveIt, wiki,
    } = props.card;
    const have = ref(haveIt);
    return {
      empty: false,
      id,
      name,
      rarity,
      org,
      patch,
      values,
      acqs,
      icon,
      surface,
      have,
      wiki,
    };
  },
});
</script>

<template>
  <n-card :class="'card-box'" content-style="padding: 20px 15px;">
    <n-thing>
      <template #avatar>
        <n-space>
          <n-avatar
            :size="25"
            :style="{
              '--color': 'rgba(255,255,255,0)',
            }"
            :class="'rarity'"
            :src="'./card/rarity' + rarity + '.png'" />
          <n-avatar :size="50" :src="'./ffxiv/icon/' + icon" />
        </n-space>
      </template>
      <template #header>
        <n-space item-style="display: flex;" align="center">
          <n-tag type="info" size="small" class="card-number">{{ id }}</n-tag>
          <span class="card-name">{{ name }}</span>
          <n-button
            type="info"
            dashed
            size="tiny"
            :data-url="wiki"
            @click="openWiki(wiki)">
              <template #icon>
                <n-icon>
                  <menu-book-outlined />
                </n-icon>
              </template>
              Wiki
            </n-button>
        </n-space>
      </template>
      <template #description :class="'card-desc'">
        <n-space item-style="display: flex;" align="center">
            <n-switch v-model:checked="have" />
            <n-tag type="success" round size="small">{{ patch }}</n-tag>
            <n-tag v-if="org !== 'none' " type="success" round size="small">{{ org }}</n-tag>
        </n-space>
      </template>
      <div class="acq-box" v-for="(acq, index) in acqs" :key=index>
        <n-space item-style="display: flex;" align="center">
          <n-avatar
            :size="18"
            :style="{
              '--color': 'rgba(255,255,255,0)',
            }"
            :class="'acq-line'"
            :src="'./card/' + acq.type + '.png'" />
          <span class="acq-desc">{{ acq.description }}</span>
        </n-space>
      </div>
    </n-thing>
  </n-card>
</template>

<style lang="scss">
.card-box {
  max-width: 1080px;
}
.card-name {
  font-weight: bold;
}
.acq-box {
  text-align: left;
  padding-left: 35px;
  font-size: 16px;
  .acq-line {
    vertical-align: middle;
  }
}
</style>
