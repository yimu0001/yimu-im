import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    axiosBaseUrl: 'https://shandianyun-im.iqilu.com', // 暂时没用到
    contacti: {},
    currentOrgUsers: [],
  },
  mutations: {
    setAxiosBaseUrl(state, url) {
      state.axiosBaseUrl = url;
    },
    SET_CONTACT: (state, contacti) => {
      state.contacti = contacti;
    },
    setCurrentOrgUsers(state, users) {
      state.currentOrgUsers = users;
    },
  },
  actions: {
    SetContact({ commit }, contacti) {
      return new Promise(() => {
        commit('SET_CONTACT', contacti);
      });
    },
  },
  modules: {},
});
