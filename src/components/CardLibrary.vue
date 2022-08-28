<script setup lang="ts">
import {
  onMounted, computed, watch, ref,
} from 'vue';
import { groupBy, chunk, random } from 'lodash-es';
import Fuse from 'fuse.js';
import WarningAmberOutlined from '@vicons/material/WarningAmberOutlined';
import MenuBookRound from '@vicons/material/MenuBookRound';
import FileExport from '@vicons/tabler/FileExport';
import FileUpload from '@vicons/tabler/FileUpload';
import {
  NLayout, NLayoutHeader, NLayoutContent, NAutoComplete,
} from 'naive-ui';
import { useStore } from '@/store';
import UserCardDB from '@/store/db';
import CardSolt from '@/components/CardSolt.vue';
import CardDataTable from '@/components/CardDataTable.vue';

const { state, dispatch } = useStore();
const { cardRecord, cardKeys, cardTags } = state;

const fuse = new Fuse(cardTags, {
  includeScore: true,
  threshold: 0.3,
  keys: ['id', 'tags'],
});

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
const prominent = ref('none');
const thisRef: Record<string, HTMLElement> = {};
const itemRefs = ref(thisRef);
const openLibrary = ref(false);
const onlyNotHaving = ref(false);
const card = (id: string) => cardRecord[id];
const tag = (id: string) => (id.startsWith('编号外') ? id : `编号 ${id}`);
const patch = (p: string) => (p.length === 1 ? `${p}.0` : p);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const scrollTo: any = (id: string | undefined) => {
  if (id && itemRefs.value[id]) {
    itemRefs.value[id].scrollIntoView({ block: 'center' });
    prominent.value = id;
  } else if (id === 'random') {
    const notGetting = cardKeys.filter((cardId) => !userCardState.value.has(cardId));
    const rd = notGetting[random(0, notGetting.length - 1)];
    itemRefs.value[rd].scrollIntoView({ block: 'center' });
    prominent.value = rd;
  }
};

const completion = computed(() => `${state.userCardCount} / ${state.cardCount}`);

watch(
  () => state.userCard,
  (userCard) => {
    userCardState.value = userCard;
  },
);

onMounted(() => {
  userCardState.value = state.userCard;
});

const chose = (id: string | undefined) => {
  hover.value = id != null ? id : cardRecord[cardKeys[0]].id;
  if (isEditModel.value) {
    if (userCardState.value.has(id)) {
      userCardState.value.delete(id);
    } else {
      userCardState.value.add(id);
    }
  }
};
const currentChose = (id: string | undefined) => {
  if (id && cardRecord[id]) {
    if (userCardState.value.has(id)) {
      userCardState.value.delete(id);
      dispatch('saveOneUserCard', { id, getting: false });
    } else {
      userCardState.value.add(id);
      dispatch('saveOneUserCard', { id, getting: true });
    }
  }
};
const setItemRef = (el: HTMLElement) => {
  if (el?.dataset?.key) {
    itemRefs.value[el.dataset.key] = el;
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

const exportCardInfo = () => {
  if (window.$electron?.api) {
    UserCardDB.getUserCard().then((userCard) => {
      window.$electron?.api.exportCardInfo(userCard?.cards);
    });
  }
};

const importCardInfo = () => {
  if (window.$electron?.api) {
    window.$electron?.api.importCardInfo();
  }
};

// const tableHeight = computed(() => document.body.scrollHeight - 180);

const inputTag = ref('');
const autoOptions = computed(() => {
  const value = inputTag.value === null ? '' : inputTag.value;
  const se = fuse.search(value);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: Array<any> = [];
  if (se && se.length > 0) {
    result = se
      .map((s) => {
        const si = s.item.id;
        const scard = cardRecord[si];
        if (scard) {
          return {
            label: `[${scard.id}]${scard.name}, ${scard.acqs
              ?.filter((acq) => acq.type === 'npc' || 'battle')
              .map((acq) => acq.description)
              .join(';')}`,
            value: scard.id,
          };
        }
        return null;
      })
      .filter((item) => item != null);
  }
  if (result != null && result.length > 0) {
    return result;
  }
  return [
    {
      label: '什么都没找到, 要不要随便来一张?',
      value: 'random',
    },
  ];
});
</script>

<template>
  <n-layout-content style="height: 100%">
    <n-layout position="absolute" style="height: 100%" :native-scrollbar="false">
      <n-layout-header bordered style="padding: 10px 50px 10px 50px">
        <n-grid x-gap="12" :cols="6">
          <n-gi span="3">
            <n-auto-complete
              clear-after-select
              :options="autoOptions"
              style="width: 100%"
              @select="scrollTo"
              @focus="() => { onlyNotHaving = false }"
              v-model:value="inputTag"
              placeholder="寻找心爱的幻卡"
            />
          </n-gi>
          <n-gi span="1">
            <n-switch
              :round="false"
              v-model:value="onlyNotHaving"
              size="large"
              style="height: 100%"
            >
              <template #checked>只看未获得</template>
              <template #unchecked>只看未获得</template>
            </n-switch>
          </n-gi>
          <n-gi span="1" :offset="1">
            <n-space align="center" justify="end">
              <div class="card-completion">{{ completion }}</div>
              <n-button type="error" @click="openLibrary = true">我的幻卡库</n-button>
            </n-space>
          </n-gi>
        </n-grid>
        <n-modal v-model:show="openLibrary" style="width: 80%" preset="card">
          <n-space justify="center">
            <div class="card-list">
              <n-space
                style="margin-bottom: 10px"
                align="baseline"
                justify="space-between"
              >
                <n-switch
                  v-model:value="isEditModel"
                  @update:value="updateUserCard"
                  size="large"
                >
                  <template #checked>编辑模式</template>
                  <template #unchecked>编辑模式</template>
                </n-switch>
                <n-popconfirm v-model:show="showCleanConfirm">
                  <template #trigger>
                    <n-button
                      :disabled="!isEditModel"
                      size="small"
                      icon-placement="right"
                      type="error"
                    >
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
                    :card="cardRecord[id]"
                    :size="44"
                    @chose="chose"
                  />
                </n-gi>
              </n-grid>
            </div>
            <div class="card-detail">
              <div class="card-info">
                <div class="card-surface">
                  <n-tag size="small" type="info">{{ `${tag(card(hover).id)}` }}</n-tag>
                  <n-avatar
                    :size="26"
                    :style="{
                      '--color': 'rgba(255,255,255,0)',
                      backgroundColor: 'rgba(255,255,255,0)'
                    }"
                    :class="'rarity'"
                    :src="'./card/rarity' + card(hover).rarity + '.png'"
                  />
                  <n-image :src="`./ffxiv/surface/${card(hover).surface}`" />
                  <div class="card-values">
                    <span
                      :class="`card-value top
                              ${card(hover).values?.[0] === 'A' ? 'small' : ''}`"
                    >
                      {{ card(hover).values?.[0] }}
                    </span>
                    <span
                      :class="`card-value right
                              ${card(hover).values?.[1] === 'A' ? 'small' : ''}`"
                    >
                      {{ card(hover).values?.[1] }}
                    </span>
                    <span
                      :class="`card-value bottom
                              ${card(hover).values?.[2] === 'A' ? 'small' : ''}`"
                    >
                      {{ card(hover).values?.[2] }}
                    </span>
                    <span
                      :class="`card-value left
                              ${card(hover).values?.[3] === 'A' ? 'small' : ''}`"
                    >
                      {{ card(hover).values?.[3] }}
                    </span>
                  </div>
                </div>
                <div class="card-ext">
                  <n-space class="card-tags" align="end">
                    <n-button
                      class="wiki-btn"
                      size="small"
                      type="info"
                      dashed
                      @click="wiki(card(hover).wiki)"
                    >
                      <template #icon>
                        <n-icon>
                          <menu-book-round />
                        </n-icon>
                      </template>
                      {{ card(hover).name }}
                    </n-button>
                    <n-tag class="patch-tag" round type="success">{{
                      `${patch(card(hover).patch)}`
                    }}</n-tag>
                    <n-tag
                      v-if="card(hover).org != 'none'"
                      class="org-tag"
                      type="success"
                      >{{ `${card(hover).org}` }}</n-tag
                    >
                  </n-space>
                </div>
              </div>
              <div class="card-acqs">
                <div class="acq" v-for="(acq, i) in card(hover).acqs" :key="i">
                  <n-avatar
                    :size="18"
                    :style="{
                      '--color': 'rgba(255,255,255,0)',
                      backgroundColor: 'rgba(255,255,255,0)'
                    }"
                    :class="'acq-icon'"
                    :src="'./card/' + acq.type + '.png'"
                  />
                  <span class="acq-desc">{{ acq.description }}</span>
                </div>
              </div>
            </div>
          </n-space>
          <template #footer>
            <n-space justify="end">
              <n-button type="warning" strong secondary @click="importCardInfo">
                <template #icon>
                  <n-icon>
                    <file-upload />
                  </n-icon>
                </template>
                从文件恢复
              </n-button>
              <n-button type="info" @click="exportCardInfo">
                <template #icon>
                  <n-icon>
                    <file-export />
                  </n-icon>
                </template>
                备份到本地
              </n-button>
            </n-space>
          </template>
        </n-modal>
      </n-layout-header>
      <n-layout position="absolute" style="top: 50px">
        <n-layout-content
          position="absolute"
          style="padding: 0 50px 0 50px"
          :native-scrollbar="false"
        >
          <!-- <CardDataTable
              :set-item-ref="setItemRef" :has="has" :max-height="tableHeight" @chose="currentChose"
              :prominent="prominent" :card-keys="cardKeys" :card-record="cardRecord"  /> -->
          <CardDataTable
            :set-item-ref="setItemRef"
            :has="has"
            @chose="currentChose"
            :prominent="prominent"
            :only-not-having="onlyNotHaving"
            :card-keys="cardKeys"
            :card-record="cardRecord"
          />
        </n-layout-content>
      </n-layout>
    </n-layout>
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
.card-completion {
  font-size: 18px;
  font-weight: bold;
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
