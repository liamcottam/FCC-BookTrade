import axios from 'axios';

const actions = {
  getTrades({ getters }) {
    return axios.get('/api/v1/trades', {
      headers: {
        authorization: `Token ${getters.token}`,
      },
    });
  },
  updateTrade({ getters }, payload) {
    return axios.patch(`/api/v1/trades/${payload.id}`, { status: payload.status }, { // eslint-disable-line
      headers: {
        authorization: `Token ${getters.token}`,
      },
    });
  },
  markAllRead({ getters }) {
    return axios.get('/api/v1/trades/read', {
      headers: {
        authorization: `Token ${getters.token}`,
      },
    });
  },
  submitTrade({ getters }, payload) {
    return axios.post('/api/v1/trades', {
      send: payload.send,
      receive: payload.receive,
      user: payload.user,
    }, {
      headers: {
        authorization: `Token ${getters.token}`,
      },
    });
  },
};

export default {
  actions,
};
