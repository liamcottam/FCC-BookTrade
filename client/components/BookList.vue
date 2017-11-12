<template>
  <div class="books">
    <div class="item" v-for="(book, key) in books" v-bind:key="key" >
        <router-link v-if="book.owners.length" class="item-media" :to="`/books/${book.id}`">
          <img :src="book.thumbnail" />
        </router-link>
        <div class="item-media" v-else>
          <img :src="book.thumbnail" />
        </div>
        <div class="item-body">
          <router-link v-if="book.owners.length" class="item-title" :to="`/books/${book.id}`"><h4 class="card-title">{{ book.title }}</h4></router-link>
          <h4 class="card-title" v-else>{{ book.title }}</h4>
          <p><small><span class="muted">by {{ (book.author) ? book.author : 'Unknown Author' }}</span><span v-if="book.owners.length"> - {{ book.owners.length }} owner{{ (book.owners.length > 1) ? 's' : '' }}</span></small></p>
          <template v-if="authenticated && book.owners.length && !bookInLibrary(book.owners)">
            <b-dropdown class="actions" text="Propose Trade" @click="proposeTrade(key)" split>
              <b-dropdown-item @click="addToLibrary(key)"><i class="fa fa-plus" /> Add to library</b-dropdown-item>
            </b-dropdown>
          </template>
          <template v-else-if="authenticated">
            <b-button v-if="bookInLibrary(book.owners)" class="actions" @click="removeFromLibrary(key)"><i class="fa fa-minus"/> Remove from library</b-button>
            <b-button v-else class="actions" @click="addToLibrary(key)"><i class="fa fa-plus"/> Add to library</b-button>
          </template>
          <template v-if="book.shortDescription">
            <p class="long-desc" v-if="toggled.indexOf(key) !== -1">{{ book.description }} <a href="#" v-on:click.prevent="toggleReadMore(key)">read less</a></p>
            <p class="desc" v-else>{{ book.shortDescription }} <a href="#" v-on:click.prevent="toggleReadMore(key)">read more</a></p>
          </template>
          <template v-else>
            <p class="long-desc">{{ (book.description) ? book.description : 'No description provided' }}</p>
          </template>
        </div>
      </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    books: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      toggled: [],
    };
  },
  created() {
    this.$watch('books', () => {
      this.toggled = [];
    });
  },
  methods: {
    toggleReadMore(key) {
      const idx = this.toggled.indexOf(key);
      if (idx !== -1) {
        this.toggled.splice(idx, 1);
      } else {
        this.toggled.push(key);
      }
    },
    bookInLibrary(owners) {
      if (owners.length !== 0 && this.authenticated) {
        return owners.indexOf(this.user_id) !== -1;
      }
      return false;
    },
    addToLibrary(key) {
      this.books[key].owners.push(this.user_id);
      this.$store.dispatch('addToLibrary', { id: this.books[key].id });
      this.$store.dispatch('setStateInconsistent', this.$route.path);
    },
    removeFromLibrary(key) {
      this.books[key].owners.splice(this.books[key].owners.indexOf(this.user_id), 1);
      this.$store.dispatch('removeFromLibrary', { id: this.books[key].id });
      this.$store.dispatch('setStateInconsistent', this.$route.path);
    },
    proposeTrade(key) {
      const query = {};
      if (this.$route.params.username) {
        query.username = this.$route.params.username;
      }
      this.$router.push({ path: `/trade/create/${this.books[key].id}`, query });
    },
  },
  computed: {
    ...mapGetters([
      'authenticated',
      'user_id',
    ]),
  },
};
</script>

<style lang="scss">
.books {
  margin-top: 8px;

  .item {
    display: table;
    clear: both;
    margin-bottom: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    padding: 25px;
    width: 100%;

    .item-title {
      color: #000;
      text-decoration: none;

      &:hover {
        text-decoration: none;
      }

      &:focus {
        outline: none;
      }
    }

    .item-media {
      float: left;
      margin-right: 1rem;

      img {
        width: 118px;
        height: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
      }
    }

    .item-body {
      overflow: hidden;

      h4,
      p {
        margin: 0;
        padding: 0;
      }

      .long-desc {
        white-space: pre-line;
      }
    }
  }
}

@media only screen and (max-width: 480px) {
  .item-media {
    margin-bottom: 8px;

    img {
      width: 75px !important;
      height: auto !important;
    }
  }

  .item-body {
    overflow: unset !important;

    .desc,
    .long-desc {
      clear: both;
    }
  }
}
</style>
