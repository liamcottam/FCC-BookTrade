<template>
  <div class="container mt-4">
    <loading v-if="loading"></loading>
    <book-list variant="home" :books="items" v-if="items.length"></book-list>    
    <div class="error" v-else-if="!error">
      <h3>Looks like no one has any books...</h3>
      <small>Click the button below to get the ball rolling</small>
      <div class="error-actions">
        <b-button variant="success" to="add-book"><i class="fa fa-plus"></i> Add Books</b-button>
      </div>
    </div>
    <div class="error" v-else-if="error">
      <h3>An Error Occurred</h3>
      <small>{{ error }}</small>
      <div class="error-actions">
        <b-button variant="primary" @click="refreshData"><i class="fa fa-refresh"></i> Refresh</b-button>
      </div>
    </div>
  </div>
</template>

<script>
import EventBus from '@/event-bus';
import store from '@/store';

export default {
  name: 'home',
  data() {
    return {
      loading: false,
      error: null,
      items: [],
    };
  },
  created() {
    EventBus.$on('refresh', this.refreshData);
    this.refreshData();
  },
  destroyed() {
    EventBus.$off('refresh');
  },
  methods: {
    refreshData() {
      if (this.loading) return;
      this.loading = true;
      this.$store.dispatch('getBooks').then((res) => {
        this.loading = false;
        this.items = res.data;
      }).catch(() => {
        this.loading = false;
        this.error = 'Failed to retrieve data from API';
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
