<template>
  <div class="container">
    <page-title></page-title>
    <loading v-if="loading"></loading>
    <div class="row" v-else>
      <div class="col-lg-2 text-center">
        <h4>Their book</h4>
        <img class="img img-fluid" :src="book.thumbnail" />
        <h4>{{ book.title }} by {{ book.author }}</h4>
      </div>
      <div class="col-lg-8">
        <hr>
        <b-form-group>
          <b slot="label">Select User:</b>
          <b-form-select v-model="target">
            <option v-for="(owner, key) in book.owners" v-bind:key="key" :value="owner">{{ owner.username }}</option>
          </b-form-select>
        </b-form-group>
        <b-form-group>
          <b slot="label">Select Book:</b>
          <b-form-select v-model="selected">
            <option v-for="(option, key) in options" v-bind:key="key" :value="option">{{ option.title }} - {{ option.author }}</option>
          </b-form-select>
        </b-form-group>
        <div class="text-center">
          <b-button variant="success" v-b-modal.modal-center>Submit Trade <span class="fa fa-refresh"></span></b-button>
        </div>
        <hr>
      </div>
      <div class="col-lg-2 text-center">
        <h4>Your book</h4>
        <img class="img img-fluid" :src="selected.thumbnail" />
        <h4>{{ selected.title }} by {{ selected.author }}</h4>
      </div>
      <b-modal id="modal-center" title="Submit Trade?" centered no-fade ref="modal" @ok="handleProposeTrade" @cancel="handleCancel" @hide="handleHide">
        <p>Propose the trade <b>{{ book.title }}</b> for <b>{{ selected.title }}</b>?</p>
      </b-modal>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'trade',
  data() {
    return {
      book: null,
      loading: true,
      selected: null,
      target: null,
      options: [],
      error: null,
      submitting: false,
    };
  },
  created() {
    const getBook = this.$store.dispatch('getBook', { id: this.$route.params.id });
    const userBooks = this.$store.dispatch('getBooksByUser', { username: this.username });
    const target = this.$route.query.username;

    Promise.all([getBook, userBooks]).then((res) => {
      this.book = res[0].data;
      if (this.book.owners.length === 0) {
        alert('No one owns this book anymore. :('); // eslint-disable-line
        this.$router.push('/');
      }
      if (this.book.owners.findIndex(owner => owner.id === this.user_id) !== -1) {
        alert('You already own this book...'); // eslint-disable-line
        this.$router.push('/');
      }
      if (target) {
        const idx = this.book.owners.findIndex(owner => owner.username === target);
        if (idx !== -1) {
          this.target = this.book.owners[idx];
        } else {
          alert('The user you selected no longer owns this book! :('); // eslint-disable-line
        }
      } else {
        [this.target] = this.book.owners;
      }
      if (res[1].data.books.length === 0) {
        alert('You have no books to trade...'); // eslint-disable-line
        this.$router.push('/');
      }
      this.options = res[1].data.books;
      [this.selected] = this.options;  // eslint-disable-line
      this.loading = false;
    }).catch(() => {
    });
  },
  methods: {
    handleProposeTrade(evt) {
      evt.preventDefault();
      this.submitting = true;
      this.$store.dispatch('submitTrade', {
        send: this.book.id,
        receive: this.selected.id,
        user: this.target._id, // eslint-disable-line
      }).then(() => {
        this.submitting = false;
        this.$router.push('/');
      }).catch(() => {
        this.submitting = false;
        alert('Failed to create trade'); // eslint-disable-line
      });
    },
    handleSubmit() {
      this.$refs.modal.hide();
    },
    handleCancel(evt) {
      if (this.submitting) evt.preventDefault();
    },
    handleHide(evt) {
      if (this.submitting) evt.preventDefault();
    },
  },
  computed: {
    ...mapGetters([
      'username',
      'user_id',
    ]),
  },
};
</script>

<style lang="scss">
.modal-dialog-centered {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 100%;
  margin-top: 0!important;
  margin-bottom: 0!important;
}

.modal-dialog-centered .modal-content {
  width: 100%;
}

.custom-select {
  -webkit-appearance: none;
}

#modal-center {
  p { margin: 0; }
}
</style>
