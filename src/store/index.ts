import { InjectionKey } from 'vue';
import {
  createStore, Store, useStore as basicUseStore,
} from 'vuex';
import { Card } from '@/types';

export interface State {
  loading: boolean,
  cardData: Array<Card>,
  pageCount: number,
  userData: Record<string, boolean>
}

export const storeKey: InjectionKey<Store<State>> = Symbol('global state key');

export function useStore() {
  return basicUseStore(storeKey);
}

export default createStore<State>({
  state: {
    loading: true,
    cardData: [],
    pageCount: 1,
    userData: {},
  },
  mutations: {
    loading(state, loading) {
      // console.log(`set loading ${loading}`);
      state.loading = loading;
    },
    pushCardData(state, cardData: Array<Card>) {
      state.cardData = Array.from(cardData);
      state.pageCount = Math.ceil(cardData.length / 30 / 3);
    },
    pushUserData(state, userData: Record<string, boolean>) {
      state.userData = { ...userData };
    },
  },
  actions: {
    saveUserData({ commit }, userData) {
      const data = { ...userData };
      if (window.$electron?.api) {
        console.log('save user card data');
        window.$electron.api.setStoreValue('card', data);
      }
      commit('pushUserData', data);
    },
    saveUserCard({ state, commit }, { id, value }) {
      const userData = { ...state.userData };
      if (window.$electron?.api) {
        if (value) {
          window.$electron.api.setStoreValue(`card.${id}`, value);
        } else {
          window.$electron.api.deleteStoreValue(`card.${id}`);
        }
      }
      if (value) {
        userData[id] = true;
      } else {
        delete userData[id];
      }
      commit('pushUserData', userData);
    },
  },
});
