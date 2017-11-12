import axios from 'axios';

const actions = {
  getBooks() {
    return axios.get('/api/v1/books');
  },
  getBook(_, payload) {
    return axios.get(`/api/v1/books/${payload.id}`);
  },
  searchBooks(_, payload) {
    return axios.get(`/api/v1/books/search/${encodeURIComponent(payload.query)}`);
  },
  addToLibrary({ getters }, payload) {
    return axios.post('/api/v1/users/library', payload, {
      headers: {
        authorization: `Token ${getters.token}`,
      },
    });
  },
  removeFromLibrary({ getters }, payload) {
    return axios.delete(`/api/v1/users/library/${payload.id}`, {
      headers: {
        authorization: `Token ${getters.token}`,
      },
    });
  },
  getBooksByUser(_, payload) {
    return axios.get(`/api/v1/users/${payload.username}/library`);
  },
};

export default {
  actions,
};
