<script setup lang="ts">
import {
  withDefaults, defineProps, defineEmits, computed, h,
} from 'vue';
import {
  NDataTable, NSpace,
} from 'naive-ui';
import CardSolt from '@/components/CardSolt.vue';
import {
  CardTagId, CardTagPatch, CardTagOrg, CardWiki, BattleInfo,
} from '@/components/CardTag';
import type { Card } from '@/types';

interface Props {
  // eslint-disable-next-line no-unused-vars
  setItemRef?: (el: HTMLElement) => void
  // eslint-disable-next-line no-unused-vars
  has: (id: string) => boolean
  prominent?: string
  cardRecord: Record<string, Card>,
  cardKeys: Array<string>,
  maxHeight?: number,
  onlyNotHaving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  prominent: 'none',
});

const rowProps = (row: Card) => ({
  'data-key': row.id,
  ref: props.setItemRef,
});
const rowClasses = (row: Card) => {
  let clz = '';
  if (props.onlyNotHaving && props.has(row.id)) {
    clz += 'not-visable ';
  }
  if (row.id === props.prominent) {
    clz += 'prominent ';
  }
  return clz;
};

interface ColumnsOptions {
  // eslint-disable-next-line no-unused-vars
  wiki: (url: string) => void
}

// eslint-disable-next-line no-unused-vars
const emits = defineEmits<{(e: 'chose', id: string | undefined): void | undefined }>();

const thisChose = (id: string | undefined) => {
  emits('chose', id);
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
          has: !props.has(card.id),
          card,
          onChose: thisChose,
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
            return h('span', {}, acq.description);
          }),
        },
      );
    },
  },
];

const data = computed(() => props.cardKeys.map((key) => props.cardRecord[key]));
const columns = createColumns({
  wiki: (url: string) => {
    if (window.$electron?.api) {
      window.$electron?.api.openUrl(url);
    } else {
      window.open(url);
    }
  },
});

</script>

<template>
  <n-data-table v-if="maxHeight != null"
    :max-height="maxHeight"
    virtual-scroll
    :columns="columns"
    :row-props="(rowProps as any)"
    :row-class-name="rowClasses"
    :data="data" :row-key="(card: Card) => card.pos" />
  <n-data-table v-else
    :columns="columns"
    :row-props="(rowProps as any)"
    :row-class-name="rowClasses"
    :data="data" :row-key="(card: Card) => card.pos" />
</template>

<style lang="scss">
.not-visable {
  display: none;
}
</style>
