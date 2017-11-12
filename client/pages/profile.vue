<template>
  <div class="container">
    <page-title></page-title>
    <loading v-if="loading"/>
    <book-list :books="books" v-if="books.length"></book-list>
    <div class="error" v-else-if="!error">
      <h3>Looks like you have no books...</h3>
      <small>Click the button below to get started.</small>
      <div class="error-actions">
        <b-button variant="success" to="add-book"><i class="fa fa-plus"></i> Add Books</b-button>
      </div>
    </div>
    <div class="error" v-else>
      <h3>{{ error }}</h3>
      <div class="error-actions">
        <b-button variant="primary" @click="refreshData"><i class="fa fa-refresh"></i> Retry</b-button>
        <b-button variant="primary" to="/" exact><i class="fa fa-home"></i> Go Home</b-button>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/store';
import { mapGetters } from 'vuex';

export default {
  name: 'library',
  data() {
    return {
      books: [],
      loading: false,
      error: null,
      isOwnProfile: false,
    };
  },
  created() {
    this.refreshData();
    this.$root.$on('refresh', this.refreshData);
  },
  destroyed() {
    this.$root.$off('refresh');
  },
  methods: {
    refreshData() {
      this.isOwnProfile = this.$route.path === '/library' || this.username === this.$route.params.username;
      const username = (this.isOwnProfile) ? this.username : this.$route.params.username;
      if (!this.isOwnProfile) {
        this.$route.meta.title = `${username}'s Library`;
      } else {
        this.$route.meta.title = 'My Library';
      }

      this.loading = true;
      this.$store.dispatch('getBooksByUser', { username }).then((res) => {
        this.books = res.data.books;
        this.loading = false;
      }).catch((err) => {
        if (err.response.data.msg) {
          this.error = err.response.data.msg;
        } else {
          this.error = 'Failed to load page';
        }
        this.loading = false;
      });
    },
  },
  computed: {
    ...mapGetters([
      'username',
    ]),
  },
  beforeRouteEnter(to, from, next) {
    if (store.state.inconsistentState.indexOf(to.path) !== -1) {
      store.dispatch('setStateResolved', to.path);
      next((vm) => {
        vm.$root.$emit('refresh');
      });
    } else {
      next();
    }
  },
};
</script>
