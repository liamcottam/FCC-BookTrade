<template>
  <div class="container">
    <div class="mt-3 text-center header font-weight-light">
      <h1 class="font-weight-light">{{ loading ? 'Loading...' : data.title }}</h1>
      <hr class="mt-3"/>  
    </div>
    <template v-if="!loading">
      <div class="row">
        <div class="col-lg-2 text-center">
          <img class="img img-fluid" :src="data.thumbnail" />
        </div>
        <div class="col-lg-10">
          <h4>{{ data.title }} by {{ data.author }}</h4>
          <p>{{ data.description }}</p>
          <b-list-group>
            <b-list-group-item><h5>Owners</h5></b-list-group-item>
            <b-list-group-item v-for="(owner, key) in data.owners" v-bind:key="key">
              <router-link :to="`/users/${owner.username}`">{{ owner.username }}</router-link>
              <b-button v-if="authenticated && !userOwnsBook" :to="{ path: `/trade/create/${data.id}`, query: { username: owner.username } }" size="sm" class="pull-right">Offer Trade</b-button>
            </b-list-group-item>
          </b-list-group>
        </div>
      </div>
    </template>
    <loading v-else></loading>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'books',
  data() {
    return {
      loading: true,
      data: null,
      userOwnsBook: false,
    };
  },
  created() {
    this.$store.dispatch('getBook', { id: this.$route.params.id }).then((data) => {
      this.loading = false;
      this.data = data.data;
      for(let i = 0; i < this.data.owners.length; i++) { // eslint-disable-line
        const owner = this.data.owners[i];
        if (owner.username === this.username) {
          this.userOwnsBook = true;
          break;
        }
      }
    }).catch(() => {
    });
  },
  computed: {
    ...mapGetters([
      'authenticated',
      'username',
    ]),
  },
};
</script>

<style lang="scss">
.list-group-item h5 {
  margin-bottom: 0;
}

.list-group-item {
  a {
    vertical-align: middle;
  }
}
</style>

