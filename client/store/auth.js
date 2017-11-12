import axios from 'axios';

const initialState = {
  user_data: JSON.parse(localStorage.getItem('user_data')),
};

const authGetters = {
  authenticated(state) {
    return state.user_data !== null;
  },
  user_id(state, gts) {
    if (!gts.authenticated) {
      return null;
    }
    return state.user_data.id;
  },
  username(state, gts) {
    if (!gts.authenticated) {
      return null;
    }
    return state.user_data.username;
  },
  name(state, gts) {
    if (!gts.authenticated) {
      return null;
    }
    return state.user_data.name;
  },
  city(state, gts) {
    if (!gts.authenticated) {
      return null;
    }
    return state.user_data.city;
  },
  state(state, gts) {
    if (!gts.authenticated) {
      return null;
    }
    return state.user_data.state;
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
  },
  changeUsername({ state, getters, commit }, username) {
    return new Promise((resolve, reject) => {
      axios.patch('/api/v1/users/username', { username }, {
        headers: {
          authorization: `Token ${getters.token}`,
        },
      }).then(() => {
        const userData = Object.assign({}, state.user_data);
        userData.username = username;
        commit('authenticated', userData);
        resolve();
      }).catch(reject);
    });
  },
  changePassword({ getters }, data) {
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
  updateProfile({ state, getters, commit }, data) {
    return new Promise((resolve, reject) => {
      axios.patch('/api/v1/users', data, {
        headers: {
          authorization: `Token ${getters.token}`,
        },
      }).then(() => {
        const userData = Object.assign({}, state.user_data);
        userData.name = (data.name) ? data.name : null;
        userData.city = (data.city) ? data.city : null;
        userData.state = (data.state) ? data.state : null;
        commit('authenticated', userData);
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
  getters: authGetters,
  actions,
  mutations,
};
