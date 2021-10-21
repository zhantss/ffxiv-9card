import { createStore } from 'vuex';

export default createStore({
  state: {
    loading: true,
  },
  mutations: {
    loading(state, loading) {
      console.log(`set loading ${loading}`);
      state.loading = loading;
    },
  },
});
