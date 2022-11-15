<script setup lang="ts">
import {
  watch, computed, ref, h,
} from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import {
  NLayout, NLayoutSider, NLayoutContent, NMenu, NEmpty, NEllipsis, NDataTable,
  NSpace, NLayoutHeader,
} from 'naive-ui';
import { useStore } from '@/store';
import CardSolt from '@/components/CardSolt.vue';
import {
  CardTagId, CardTagPatch, CardTagOrg, CardWiki, TaskWiki, BattleInfo, TokenInfo,
} from '@/components/CardTag';
import type { Card } from '@/types';

const { state, dispatch } = useStore();
const { cardExt, cardRecord } = state;
const route = useRoute();
const currentExt = ref(route.params.ext.toString());
const contents = computed(() => cardExt.content[currentExt.value]);
const sorts = computed(() => (cardExt.sorts ? cardExt.sorts[currentExt.value] : null));
const menus = computed(() => (sorts.value || Object.keys(contents.value)).map((key) => ({
  label: () => h(RouterLink, {
    to: {
      path: `/about/${currentExt.value}/${key}`,
    },
  }, () => h(NEllipsis, null, { default: () => key })),
  key,
})));
const selection = ref(route.params.and ? route.params.and.toString() : menus.value[0].key);
const userCardState = ref(state.userCard);
const has = (id: string) => userCardState.value.has(id);
const chose = (id: string | undefined) => {
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
watch(
  () => route.params.ext,
  (ext) => {
    if (typeof ext === 'string') {
      currentExt.value = ext;
      selection.value = menus.value[0].key;
    }
  },
);
watch(
  () => route.params.and,
  (and) => {
    if (and === null || and === undefined || and.length === 0) {
      selection.value = menus.value[0].key;
      return;
    }
    if (typeof and === 'string') {
      selection.value = and;
    }
  },
);
watch(
  () => state.userCard,
  (userCard) => {
    userCardState.value = userCard;
  },
);

const instance = computed(() => contents.value[selection.value]);

const completion = computed(() => {
  const { cards } = contents.value[selection.value];
  return `${cards.filter((card) => state.userCard.has(card)).length} / ${cards.length}`;
});

const aboutDetails = computed(() => contents.value[selection.value].details);

const prominent = ref('none');
const thisRef: Record<string, HTMLElement> = {};
const itemRefs = ref(thisRef);
const setItemRef = (el: HTMLElement) => {
  if (el?.dataset?.key) {
    itemRefs.value[el.dataset.key] = el;
  }
};
const scrollTo = (id: string| undefined) => {
  if (id && itemRefs.value[id]) {
    itemRefs.value[id].scrollIntoView({ block: 'center' });
    prominent.value = id;
  }
};

interface ColumnsOptions {
  // eslint-disable-next-line no-unused-vars
  wiki: (url: string) => void
}

const rowProps = (row: Card) => ({
  'data-key': row.id,
  ref: setItemRef,
});
const rowClasses = (row: Card) => {
  if (row.id === prominent.value) {
    return 'prominent';
  }
  return '';
};

const openUrl = (url: string) => {
  if (window.$electron?.api) {
    window.$electron?.api.openUrl(url);
  } else {
    window.open(url);
  }
};

const createColumns = ({ wiki }: ColumnsOptions) => [
  {
    title: '',
    key: 'icon',
    width: 70,
    render(card: Card) {
      return h(
        CardSolt,
        {
          size: 50,
          has: !has(card.id),
          card,
          onChose: chose,
        },
      );
    },
  },
  {
    title: '幻卡',
    key: 'name',
    width: 250,
    render(card: Card) {
      return h(
        NSpace,
        {
          vertical: true,
        },
        () => [h(CardTagId, { cardId: card.id }), h(
          CardWiki,
          {
            type: 'info',
            card,
            onOpenWiki: wiki,
          },
        )],
      );
    },
  },
  {
    title: '标签',
    key: 'id',
    width: 200,
    render(card: Card) {
      return h(
        NSpace,
        {
          align: 'center',
        },
        () => [h(CardTagPatch, { patch: card.patch }), h(CardTagOrg, { org: card.org })],
      );
    },
  },
  {
    title: '获取方式',
    key: 'acqs',
    render(card: Card) {
      return h(
        NSpace,
        {
          vertical: true,
        },
        {
          default: () => card.acqs?.map((acq) => {
            if (acq.battle) {
              return h(BattleInfo, acq.battle);
            }
            if (acq.token) {
              return h(TokenInfo, acq.token);
            }
            return h('span', {}, acq.description);
          }),
        },
      );
    },
  },
];

const data = computed(() => instance.value.cards.map((card) => cardRecord[card]));
const columns = createColumns({
  wiki: openUrl,
});

</script>

<template>
  <n-layout-sider v-if="contents != null" :width="180" :native-scrollbar="false" bordered>
    <n-menu v-model:value="selection" :options="menus" :root-indent="18" />
  </n-layout-sider>
  <n-layout-content v-if="contents != null"
    content-style="padding: 15px;" :native-scrollbar="false" >
      <n-layout position="absolute" style="height: 100%">
        <n-layout-header bordered style="height: 18%; padding: 15px">
          <n-space vertical>
            <n-space align="center">
              <n-avatar
                v-if="aboutDetails?.avator" :size="56"
                :src="`ffxiv/${currentExt}/${aboutDetails?.avator}`"></n-avatar>
              <n-avatar class="empty-avatar" :style="{
                  '--color': 'rgba(255,255,255,0)',
                }"
                v-if="!aboutDetails?.avator" :size="56"></n-avatar>
              <span class="key">{{ selection }}</span>
              <span class="completion">{{ completion }}</span>
              <div class="about-rule" v-if="aboutDetails?.rules">
                <n-tag type="info"
                  v-for="(rule, i) in aboutDetails.rules" :key="i">
                  {{ rule }}
                </n-tag>
              </div>
              <div class="about-prep" v-if="aboutDetails?.prep">
                <n-space align="center">
                  <TaskWiki
                    v-for="(task, i) in aboutDetails.prep" :key="i"
                    :task-type="task.type" :task-name="task.name"
                    @open-wiki="openUrl"/>
                </n-space>
              </div>
            </n-space>
            <div class="card-scroll">
              <CardSolt :size="40" @mouseover="scrollTo(id)" @chose="chose"
                v-for="id in instance.cards" :has="!has(id)"
                :key="id" :card="cardRecord[id]" />
            </div>
          </n-space>
        </n-layout-header>
        <n-layout-content id="card-about-content" style="height: 82%;" :native-scrollbar="false">
          <n-data-table
            :columns="columns"
            :row-props="(rowProps as any)"
            :row-class-name="rowClasses"
            :data="data" :row-key="(card: Card) => card.pos" />
        </n-layout-content>
      </n-layout>
  </n-layout-content>
  <n-layout-content v-if="contents == null">
    <n-empty size="large" description="别找了,这里什么都没有"></n-empty>
  </n-layout-content>
</template>

<style lang="scss" scoped>
.key {
  font-size: 18px;
  font-weight: bold;
}
.empty-avatar {
  border: 2px dashed rgb(134 229 190 / 70%);
  box-sizing: border-box;
}
</style>

<style lang="scss">
.n-data-table-tr {
  &.prominent {
    background-color: #fff;
    td {
      background-color: rgb(134 229 190 / 30%);
    }
  }
}
</style>
