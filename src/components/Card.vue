<script lang="ts">
import {
  defineComponent, PropType, ref, getCurrentInstance,
} from 'vue';
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
      if (window.$electron?.ipcRenderer) {
        window.$electron?.ipcRenderer.invoke('openUrl', url);
      } else {
        window.open(url);
      }
    },
  },
  setup(props) {
    if (props.card == null) {
      return {
        empty: true,
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { proxy }: any = getCurrentInstance();
    const userCard = proxy?.$userCard;
    // eslint-disable-next-line vue/no-setup-props-destructure
    const {
      id, name, rarity, org, patch, values, acqs, icon, surface, haveIt, wiki,
    } = props.card;
    const have = ref(userCard != null && userCard[id] != null ? userCard[id] : haveIt);
    const haveIdChange = async (value: string) => {
      if (window.$electron?.ipcRenderer) {
        if (value) {
          window.$electron.ipcRenderer.invoke('setStoreValue', `card.${id}`, value);
        } else {
          window.$electron.ipcRenderer.invoke('deleteStoreValue', `card.${id}`);
        }
      }
    };
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
      haveIdChange,
    };
  },
});
</script>

<template>
  <n-grid cols="10" item-responsive responsive="screen">
    <n-grid-item span="10 m:8 l:8">
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
                <n-switch v-model:value="have" @update:value="haveIdChange" />
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
    </n-grid-item>
    <n-grid-item span="0 m:2 l:2">
      <div class="card-surface">
        <n-image :src="'./ffxiv/surface/' + surface" />
        <div class="card-values">
          <span :class="`card-value top ${ values?.[0] === 'A' ? 'small': ''}`">
            {{ values?.[0] }}
          </span>
          <span :class="`card-value right ${ values?.[1] === 'A' ? 'small': ''}`">
            {{ values?.[1] }}
          </span>
          <span :class="`card-value bottom ${ values?.[2] === 'A' ? 'small': ''}`">
            {{ values?.[2] }}
          </span>
          <span :class="`card-value left ${ values?.[3] === 'A' ? 'small': ''}`">
            {{ values?.[3] }}
          </span>
        </div>
      </div>
    </n-grid-item>
  </n-grid>
</template>

<style lang="scss" scoped>
.card-box {
  max-width: 980px;
}
.card-surface {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  justify-items: center;
  .card-values {
    position: absolute;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    justify-items: center;
  }
  .card-value {
    position: absolute;
    font-size: 25px;
    font-weight: bold;
    color: #fff;
    -webkit-text-stroke: 2px #000;
    &.small {
      font-size: 22px;
    }
    &.top {
      transform: translateY(20px);
    }
    &.bottom {
      transform: translateY(50px);
    }
    &.left {
      transform: translate(-20px, 35px);
    }
    &.right {
      transform: translate(20px, 35px);
    }
  }
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
