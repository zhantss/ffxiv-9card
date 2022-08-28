import { InjectionKey } from 'vue';
import {
  createStore, Store, useStore as basicUseStore,
} from 'vuex';
import { Card } from '@/types';
import cardRecord from '@/assets/ffxiv-9card-record.json';
import cardExt from '@/assets/ffxiv-9card-ext.json';
import cardTags from '@/assets/ffxiv-9card-tags.json';
import cardKeys from '@/assets/ffxiv-9card-card-keys.json';
import UserCardDB from '@/store/db';

export interface State {
  loading: boolean,
  cardKeys: Array<string>,
  userCard: Set<string>,
  cardRecord: Record<string, Card>,
  cardTags: Array<{
    id: string,
    tags: Array<string>,
  }>,
  cardExt: {
    menu: Record<string, string>,
    sorts?: Record<string, Array<string>>,
    content: Record<string, Record<string, {
      desc?: string,
      tags?: Array<string>,
      details?: {
        avator?: string,
        rules?: string[],
        notAchiev?: boolean,
        pos?: string,
        prep?: {
          conj?: string,
          type: string,
          name: string
        }[]
      },
      cards: Array<string>
    }>>
  },
  readonly cardCount: number,
  userCardCount: number,
}

export const storeKey: InjectionKey<Store<State>> = Symbol('global state key');

export function useStore() {
  return basicUseStore(storeKey);
}

const cardCount = cardKeys.length;

export default createStore<State>({
  state: {
    loading: true,
    cardKeys,
    userCard: new Set(),
    cardRecord,
    cardExt,
    cardTags,
    cardCount,
    userCardCount: 0,
  },
  mutations: {
    loading(state, loading) {
      state.loading = loading;
    },
    updateUserCard(state, cards: Set<string>) {
      state.userCard = new Set(cards);
      state.userCardCount = state.userCard.size;
    },
  },
  actions: {
    saveUserCard({ commit }, cards: Set<string>) {
      UserCardDB.saveUserCard(cards).then(() => {
        commit('updateUserCard', cards);
      });
      // if (window.$electron?.api) {
      //   console.log('save user card data');
      //   window.$electron.api.setStoreValue('card', cards);
      //   commit('updateUserCard', cards);
      // } else {
      //   UserCardDB.saveUserCard(cards).then(() => {
      //     commit('updateUserCard', cards);
      //   });
      // }
    },
    saveOneUserCard({ state, dispatch }, { id, getting }) {
      const cards = new Set(state.userCard);
      if (getting) {
        cards.add(id);
      } else if (cards.has(id)) {
        cards.delete(id);
      }
      dispatch('saveUserCard', cards);
    },
    // saveUserData({ commit }, userData) {
    //   const data = { ...userData };
    //   if (window.$electron?.api) {
    //     console.log('save user card data');
    //     window.$electron.api.setStoreValue('card', data);
    //   }
    //   commit('pushUserData', data);
    // },
    // saveUserCard({ state, commit }, { id, value }) {
    //   const userData = { ...state.userData };
    //   if (window.$electron?.api) {
    //     if (value) {
    //       window.$electron.api.setStoreValue(`card.${id}`, value);
    //     } else {
    //       window.$electron.api.deleteStoreValue(`card.${id}`);
    //     }
    //   }
    //   if (value) {
    //     userData[id] = true;
    //   } else {
    //     delete userData[id];
    //   }
    //   commit('pushUserData', userData);
    // },
  },
});
