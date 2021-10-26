<script setup lang="ts">
import { computed, ref } from 'vue';
import { groupBy, chunk } from 'lodash-es';
import WarningAmberOutlined from '@vicons/material/WarningAmberOutlined';
import MenuBookRound from '@vicons/material/MenuBookRound';
import { NLayoutContent } from 'naive-ui';
import { useStore } from '@/store';
import CardSolt from '@/components/CardSolt.vue';

const { state, dispatch } = useStore();
const { cardRecord, cardKeys } = state;
const cards = computed(() => {
  const { normal, ext } = groupBy(cardKeys, (id) => (id.startsWith('编号外') ? 'ext' : 'normal'));
  return chunk(normal, 30).concat([ext]);
});
const sum = computed(() => cards.value.length);

const page = ref(1);
const hover = ref(cardRecord[cardKeys[0]].id);
const isEditModel = ref(false);
const userCardState = ref(new Set());
const showCleanConfirm = ref(false);
const card = (id: string) => cardRecord[id];
const tag = (id: string) => (id.startsWith('编号外') ? id : `编号 ${id}`);
const patch = (p: string) => (p.length === 1 ? `${p}.0` : p);
const chose = (id: string| undefined) => {
  hover.value = id != null ? id : cardRecord[cardKeys[0]].id;
  if (isEditModel.value) {
    if (userCardState.value.has(id)) {
      userCardState.value.delete(id);
    } else {
      userCardState.value.add(id);
    }
  }
};
const cleanCard = () => {
  userCardState.value.clear();
  showCleanConfirm.value = false;
};
const updateUserCard = (sw: boolean) => {
  if (sw) {
    userCardState.value = new Set(state.userCard);
  } else {
    dispatch('saveUserCard', userCardState.value);
  }
};

const has = (id: string) => userCardState.value.has(id);
const wiki = (url: string) => {
  if (window.$electron?.api) {
    window.$electron?.api.openUrl(url);
  } else {
    window.open(url);
  }
};
</script>

<template>
    <n-layout-content style="height: 100%;">
    <n-space justify="center">
      <div class="card-list">
        <n-space style="margin-bottom: 10px" align="baseline" justify="space-between">
          <n-switch v-model:value="isEditModel" @update:value="updateUserCard" size="large">
            <template #checked>编辑模式</template>
            <template #unchecked>编辑模式</template>
          </n-switch>
          <n-popconfirm v-model:show="showCleanConfirm">
            <template #trigger>
              <n-button
                :disabled="!isEditModel"
                size="small" icon-placement="right" type="error">
                <template #icon>
                  <n-icon>
                    <warning-amber-outlined />
                  </n-icon>
                </template>
                  清空
              </n-button>
            </template>
              <span style="font-size: 16px">确认清空吗?</span>
            <template #action>
              <n-button type="error" size="small" @click="cleanCard">确认</n-button>
            </template>
          </n-popconfirm>
        </n-space>
        <n-pagination v-model:page="page" :page-count="sum" :page-slot="5" />
        <n-grid :x-gap="4" :cols="5">
          <n-gi span="1" v-for="(id, index) in cards[page - 1]" :key="index">
            <CardSolt
              :has="isEditModel && !has(id)"
              :card="cardRecord[id]" :size="44" @chose="chose" />
          </n-gi>
        </n-grid>
      </div>
      <div class="card-detail">
        <div class="card-info">
          <div class="card-surface">
            <n-tag
              size="small" type="info">{{ `${tag(card(hover).id)}` }}</n-tag>
            <n-avatar
                :size="26"
                :style="{
                  '--color': 'rgba(255,255,255,0)',
                }"
                :class="'rarity'"
                :src="'./card/rarity' + card(hover).rarity + '.png'" />
            <n-image :src="`./ffxiv/surface/${card(hover).surface}`" />
            <div class="card-values">
              <span :class="`card-value top ${ card(hover).values?.[0] === 'A' ? 'small': ''}`">
                {{ card(hover).values?.[0] }}
              </span>
              <span :class="`card-value right ${ card(hover).values?.[1] === 'A' ? 'small': ''}`">
                {{ card(hover).values?.[1] }}
              </span>
              <span :class="`card-value bottom ${ card(hover).values?.[2] === 'A' ? 'small': ''}`">
                {{ card(hover).values?.[2] }}
              </span>
              <span :class="`card-value left ${ card(hover).values?.[3] === 'A' ? 'small': ''}`">
                {{ card(hover).values?.[3] }}
              </span>
            </div>
          </div>
          <div class="card-ext">
            <n-space class="card-tags" align="end">
              <n-button
                class="wiki-btn" size="small"
                type="info" dashed @click="wiki(card(hover).wiki)">
              <template #icon>
                <n-icon>
                  <menu-book-round />
                </n-icon>
              </template>
              {{ card(hover).name }}
            </n-button>
              <n-tag
                class="patch-tag" round type="success">{{ `${patch(card(hover).patch)}` }}</n-tag>
              <n-tag v-if="card(hover).org != 'none'"
                class="org-tag" type="success">{{ `${card(hover).org}` }}</n-tag>
            </n-space>
          </div>
        </div>
        <div class="card-acqs">
            <div class="acq" v-for="(acq, i) in (card(hover).acqs)" :key="i">
              <n-avatar
                :size="18"
                :style="{
                  '--color': 'rgba(255,255,255,0)',
                }"
                :class="'acq-icon'"
                :src="'./card/' + acq.type + '.png'" />
                <span class="acq-desc">{{ acq.description }}</span>
            </div>
        </div>
      </div>
    </n-space>
    </n-layout-content>
</template>

<style lang="scss">
.card-list {
  min-height: 400px;
  .n-pagination {
    margin-bottom: 10px;
  }
}
.card-detail {
  width: 580px;
  height: 100%;
  padding-top: 68px;
}
.card-acqs {
  margin-top: 10px;
  margin-left: 20px;
  position: relative;
  height: 35%;
  display: flex;
  justify-items: center;
  padding: 20px 20px;
  border: 2px solid #000;
  border-radius: 5px;
  box-shadow: inset 2px 1px 3px;
  flex-direction: column;
  overflow-y: auto;
  .acq {
    display: inline-flex;
    align-items: center;
  }
  .acq-icon {
    vertical-align: middle;
  }
  .acq-desc {
    font-size: 16px;
  }
}
.card-info {
  display: flex;
  align-items: center;
  justify-items: center;
  position: relative;
  padding: 0 20px;
  .card-surface {
    position: relative;
    justify-content: center;
    align-items: center;
    justify-items: center;
    display: flex;
    .n-tag {
      position: absolute;
      transform: translate(-20px, -80px);
      &.org-tag {
        width: 60px;
        transform: translate(80px, -50px);
      }
      &.patch-tag {
        width: 60px;
        transform: translate(80px, -30px);
      }
    }
    .n-avatar {
      position: absolute;
      transform: translate(-30px, -40px);
    }
  }
  .card-values {
    position: absolute;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    justify-items: center;
    font-size: 24px;
    font-weight: bold;
    color: #fff;
    -webkit-text-stroke: 2px #000;
    .card-value {
      position: absolute;
    }
    .small {
      font-size: 22px;
    }
    .top {
      transform: translateY(20px);
    }
    .bottom {
      transform: translateY(50px);
    }
    .left {
      transform: translate(-20px, 35px);
    }
    .right {
      transform: translate(20px, 35px);
    }
  }
}
.card-ext {
  padding-left: 10px;
  align-self: flex-end;
  flex: 1;
}
</style>
