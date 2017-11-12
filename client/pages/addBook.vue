<template>
  <div class="container">
    <page-title/>
    <form @submit.prevent="updateQuery">
      <b-form-input type="text" id="search" placeholder="Search for a book..." v-model="search" />
    </form>
    <loading v-if="loading"></loading>
    <book-list :books="results" v-if="results.length"></book-list>
    <div class="error" v-else-if="!loading && valid">
      <h3>No results found :(</h3>
    </div>
    <div class="error" v-else-if="!loading">
      <h3>Use the search bar above to see results!</h3>
    </div>
  </div>
</template>

<script>
import EventBus from '@/event-bus';
import store from '@/store';

export default {
  name: 'add-book',
  data() {
    return {
      search: '',
      loading: false,
      valid: false,
      results: [],
    };
  },
  created() {
    EventBus.$on('refresh', this.updateQuery);
  },
  destroyed() {
    EventBus.$off('refresh');
  },
  methods: {
    updateQuery() {
      if (this.loading || this.search.length === 0) return;
      this.loading = true;
      this.valid = false;

      this.$store.dispatch('searchBooks', { query: this.search, page: 0 }).then((res) => {
        this.results = res.data;
        this.valid = true;
        this.loading = false;
      }).catch((err) => {
        alert(err); // eslint-disable-line
        this.loading = false;
      });
    },
  },
  beforeRouteEnter(to, from, next) {
    if (store.state.inconsistentState.indexOf(to.path) !== -1) {
      store.dispatch('setStateResolved', to.path);
      next(() => {
        EventBus.$emit('refresh');
      });
    } else {
      next();
    }
  },
};
</script>
