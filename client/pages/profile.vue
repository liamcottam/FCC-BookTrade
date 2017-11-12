<template>
  <div class="container mt-4">
    <loading v-if="loading"/>
    <div class="row">
      <div class="col-lg-3 user-column">
        <img src="http://via.placeholder.com/230x230"></img>
        <div class="user-info">
          <h3 class="main">{{ profile.name ? profile.name : profile.username }}</h3>
          <p><span class="sub" v-if="profile.name !== null">{{ profile.username }}</span></p>
          <p><span class="sub" v-if="profile.location"><span class="fa fa-map-marker"></span> {{ profile.location }}</span></p>
        </div>
      </div>
      <div class="col-lg-9">
        <book-list :books="books" v-if="books.length"></book-list>
        <div class="error" v-else-if="!error && !loading">
          <h3>Looks like you have no books...</h3>
          <small>Click the button below to get started.</small>
          <div class="error-actions">
            <b-button variant="success" to="add-book"><i class="fa fa-plus"></i> Add Books</b-button>
          </div>
        </div>
      </div>
    </div>
    <div class="error" v-if="error">
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
      profile: {
        username: null,
        name: null,
        location: null,
        city: null,
        state: null,
      },
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
      this.profile.username = username;
      if (!this.isOwnProfile) {
        this.$route.meta.title = `${username}'s Library`;
      } else {
        this.$route.meta.title = 'My Library';
      }

      this.loading = true;
      this.$store.dispatch('getBooksByUser', { username }).then((res) => {
        this.profile = Object.assign(this.profile, res.data.profile);
        this.profile.location = [this.profile.city, this.profile.state].filter(i => i !== null).join(', ');
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

<style lang="scss">
.user-column {
  max-width: 260px;

  .user-info {
    & > h1,h2,h3,h4,h5,p {
      margin: 0;
    }
    .main {
      padding-top: 16px;
      padding-bottom: 0;
    }
    .sub {
      font-size: 20px;
      font-style: normal;
      font-weight: 300;
      line-height: 24px;
      color: #666;
    }
  }
}

@media (max-width: 1200px) {
  .user-column {
    max-width: unset;
    text-align: center;
    flex: unset;
  }
}
</style>
