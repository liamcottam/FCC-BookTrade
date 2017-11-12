import Vue from 'vue';
import Vuex from 'vuex';
import auth from './auth';
// import search from './search';
import trades from './trades';
import books from './books';

Vue.use(Vuex);

const initialState = {
  redirect: null,
  inconsistentState: [],
};

const getters = {
  redirect(state) {
    return state.redirect || '/';
  },
};

const actions = {
  setStateInconsistent({ commit }, route) {
    const cachedRoutes = ['/', '/library', '/add-book'];
    commit('inconsistentState', cachedRoutes.filter(r => r !== route));
  },
  setStateResolved({ commit }, route) {
    commit('resolveState', route);
  },
};

const mutations = {
  redirect(state, data) {
    state.redirect = (data !== '/') ? data : null; // eslint-disable-line
  },
  inconsistentState(state, data) {
    state.inconsistentState = data; // eslint-disable-line
  },
  resolveState(state, route) {
    state.inconsistentState.splice(state.inconsistentState.indexOf(route), 1);
  },
};

export default new Vuex.Store({
  state: initialState,
  getters,
  actions,
  mutations,
  modules: {
    auth,
    trades,
    books,
  },
  strict: true,
});
