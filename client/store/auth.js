import axios from 'axios';

const initialState = {
  user_data: JSON.parse(localStorage.getItem('user_data')),
};

const getters = {
  authenticated(state) {
    return state.user_data !== null;
  },
  username(state, gts) {
    if (!gts.authenticated) {
      return null;
    }
    return state.user_data.username;
  },
  user_id(state, gts) {
    if (!gts.authenticated) {
      return null;
    }
    return state.user_data.id;
  },
  token(state, gts) {
    if (!gts.authenticated) {
      return null;
    }
    return state.user_data.token;
  },
  isOAuthUser(state, gts) {
    if (!gts.authenticated) {
      return null;
    }
    return state.user_data.is_oauth;
  },
};

const actions = {
  login({ commit }, data) {
    return new Promise((resolve, reject) => {
      axios.post('/api/v1/auth', data).then((res) => {
        commit('authenticated', res.data);
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  },
  verifyToken({ commit }, data) {
    return new Promise((resolve, reject) => {
      axios.post('/api/v1/auth/token', data).then((res) => {
        commit('authenticated', res.data);
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  },
  logout({ commit }) {
    localStorage.removeItem('user_data');
    commit('authenticated', null);
  }, /* eslint-disable */
  changeUsername({ state, getters, commit }, username) {  
    return new Promise((resolve, reject) => {
      axios.patch('/api/v1/users/username', {username}, {
        headers: {
          authorization: `Token ${getters.token}`,
        },
      }).then(() => {
        const user_data = Object.assign({}, state.user_data);
        user_data.username = username;
        commit('authenticated', user_data);
        resolve();
      }).catch(reject);
    });
  },
  changePassword({ state, getters }, data) {  
    return new Promise((resolve, reject) => {
      axios.patch('/api/v1/users/password', data, {
        headers: {
          authorization: `Token ${getters.token}`,
        },
      }).then(() => {
        resolve();
      }).catch(reject);
    });
  },
};

const mutations = {
  authenticated(state, data) {
    localStorage.setItem('user_data', JSON.stringify(data));
    state.user_data = data; // eslint-disable-line
  },
};

export default {
  state: initialState,
  getters,
  actions,
  mutations,
};
