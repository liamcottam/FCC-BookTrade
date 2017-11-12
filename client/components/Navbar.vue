<template>
  <b-navbar toggleable type="dark" variant="dark" fixed="top">
    <div class="container">
      <b-navbar-brand to="/" :event="''" @click.prevent="onHomeClick">{{ $appName }}</b-navbar-brand>
      <span>
        <a v-if="authenticated" class="trade-toggle trade-toggle-mobile" href="#" v-on:click.prevent="toggleMobileTrade">
          <span class="fa fa-bell" ></span>
          <span class="num" v-if="tradeUnreadCount >= 1">{{ tradeUnreadCount }}</span>
        </a>
        <b-navbar-toggle target="" @click.native="toggleMobileMenu"></b-navbar-toggle>
      </span>
      <b-collapse is-nav id="nav_collapse" ref="dropdown" class="no-transition">
        <b-navbar-nav>
          <b-nav-item to="/" active-class="active" :event="''" @click.prevent="onHomeClick" :active="homeActive" exact><i class="fa fa-home"/> Home</b-nav-item>
          <b-nav-item v-if="authenticated" to="/library" :event="''" @click.prevent="onLibraryClick" exact><i class="fa fa-book"/> My Library</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <template v-if="authenticated">
            <b-nav-item-dropdown ref="trades" class="trades" text="Trade" right no-caret>
              <template slot="button-content">
                <span class="fa fa-bell" ></span>
                <span class="num" v-if="tradeUnreadCount >= 1">{{ (tradeUnreadCount <= 9) ? tradeUnreadCount : '9+' }}</span>
              </template>
              <h3 class="header">Trades</h3>
              <ul class="menu" v-if="trades.length">
                <li v-for="(trade, index) in trades" v-bind:key="index" :class="trade.status !== 'offered' ? 'pad' : ''" >
                  <p href="#" @click.prevent="''">
                    <span v-if="trade.recipient.username === username"><b>{{ trade.sender.username }}</b> offered you <b>{{ trade.recipientBook.title }}</b> for <b>{{ trade.senderBook.title }}</b></span>
                    <span v-else><b>You</b> offered <b>{{ trade.recipient.username }}</b> the book <b>{{ trade.senderBook.title }}</b> for <b>{{ trade.recipientBook.title }}</b></span>
                  </p>
                  <div class="actions" v-if="trade.recipient.username === username && trade.status === 'offered'">
                    <a href="#" @click.prevent="rejectTrade(index)"><span class="fa fa-times"></span></a>
                    <a href="#" @click.prevent="acceptTrade(index)"><span class="fa fa-check"></span></a>
                  </div>
                  <div class="actions" v-else>
                    <a href="#" v-if="trade.status === 'offered'" @click.prevent="cancelTrade(index)">Cancel</a>
                    <span v-else-if="trade.status === 'accepted'"><b>Accepted</b></span>
                    <span v-else-if="trade.status === 'rejected'"><b>Rejected</b></span>
                    <span v-else-if="trade.status === 'cancelled'"><b>Cancelled</b></span>
                  </div>
                </li>
              </ul>
              <div class="no-trades" v-else><h5>You have no trades!</h5></div>
            </b-nav-item-dropdown>
            <b-nav-item-dropdown right>
              <template slot="button-content">
                <span><i class="fa fa-user"/> {{ username }}</span>
              </template>
              <b-dropdown-item to="/add-book"><i class="fa fa-plus"/> Add Books</b-dropdown-item>
              <b-dropdown-divider/>
              <b-dropdown-item to="/settings"><i class="fa fa-cog"/> Settings</b-dropdown-item>
              <b-dropdown-item @click.prevent="logout"><i class="fa fa-sign-out"/> Sign Out</b-dropdown-item>
            </b-nav-item-dropdown>
          </template>
          <b-nav-item to="/auth" right v-if="!authenticated"><i class="fa fa-sign-in"/> Sign In</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </div>
  </b-navbar>
</template>

<script>
import Vue from 'vue';
import EventBus from '@/event-bus';
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      tradeUnreadCount: 0,
      tradesAccepted: null,
      trades: [],
      timeout: null,
    };
  },
  created() {
    EventBus.$on('bv::dropdown::shown', (payload) => {
      if (payload.$el.classList.contains('trades')) {
        this.markTradesRead();
      }
    });

    EventBus.$on('refresh', this.getTrades);
    this.$watch('authenticated', this.getTrades);
    this.getTrades();
  },
  methods: {
    logout() {
      this.$store.dispatch('logout').then(() => {
        this.trades = [];
        this.tradeUnreadCount = 0;
        clearTimeout(this.timeout);
        if (this.$route.meta.auth) {
          this.$router.push('/auth');
        }
      }).catch(() => {
      });
    },
    getTrades() {
      if (this.timeout !== null) clearTimeout(this.timeout);
      if (!this.authenticated) return;
      this.$store.dispatch('getTrades').then((res) => {
        this.trades = res.data;
        this.tradeUnreadCount = this.trades.filter(i => i.status === 'offered' && i.recipient.username === this.username && i.read === false).length;
        const tradesAccepted = this.trades.filter(i => i.status === 'accepted').length;
        if (this.timeout !== null && tradesAccepted !== this.tradesAccepted) {
          this.tradesAccepted = tradesAccepted;
          EventBus.$emit('refresh');
        } else if (this.timeout !== null) {
          this.tradesAccepted = tradesAccepted;
        }
      });

      this.timeout = setTimeout(() => {
        this.getTrades();
      }, 1500);
    },
    onHomeClick() {
      if (this.isTradesVisible()) {
        if (this.$refs.dropdown.show) {
          this.$refs.dropdown.toggle();
        }
        this.hideMobileTrade();
        return;
      }

      this.refreshOrRedirect('/');
    },
    onLibraryClick() {
      this.refreshOrRedirect('/library');
    },
    refreshOrRedirect(path) {
      if (this.$route.path === path) {
        EventBus.$emit('refresh');
      } else {
        this.$router.push(path);
      }
    },
    acceptTrade(index) {
      this.updateItemStatus(index, 'accepted');
    },
    rejectTrade(index) {
      this.updateItemStatus(index, 'rejected');
    },
    cancelTrade(index) {
      this.updateItemStatus(index, 'cancelled');
    },
    updateItemStatus(index, status) {
      const copy = Object.assign({}, this.trades[index]);
      this.$store.dispatch('updateTrade', {
        id: this.trades[index]._id, // eslint-disable-line
        status,
      }).then(() => {
        copy.status = status;
        Vue.set(this.trades, index, copy);
        if (this.$route.path === '/') {
          EventBus.$emit('refresh');
        } else if (this.$route.path === '/library') {
          EventBus.$emit('refresh-library');
        }
      }).catch(() => {
        alert('Failed to update trade status...'); // eslint-disable-line
      });
    },
    markTradesRead() {
      if (this.tradeUnreadCount !== 0) {
        this.$store.dispatch('markAllRead', { id: this.trades[0]._id }).then(() => { // eslint-disable-line
          this.tradeUnreadCount = 0;
        }).catch(() => {});
      }
    },
    toggleMobileMenu() {
      if (this.isTradesVisible()) {
        this.hideMobileTrade();
      } else {
        this.$refs.dropdown.toggle();
      }
    },
    toggleMobileTrade() {
      if (this.isTradesVisible()) {
        if (this.$refs.dropdown.show) {
          this.$refs.dropdown.toggle();
        }
        this.hideMobileTrade();
      } else {
        this.showMobileTrade();
        if (!this.$refs.dropdown.show) {
          this.$refs.dropdown.toggle();
        }
      }
    },
    showMobileTrade() {
      this.$nextTick(() => {
        this.$refs.trades.$el.classList.add('show');
        this.$refs.trades.$refs.menu.classList.add('show');
        document.body.classList.add('overlay');
        this.markTradesRead();
      });
    },
    hideMobileTrade() {
      this.$nextTick(() => {
        this.$refs.trades.$el.classList.remove('show');
        this.$refs.trades.$refs.menu.classList.remove('show');
        document.body.classList.remove('overlay');
      });
    },
    isTradesVisible() {
      return (this.authenticated && this.$refs.trades.$el.classList.contains('show'));
    },
  },
  computed: {
    ...mapGetters([
      'authenticated',
      'username',
      'user_id',
    ]),
    homeActive() {
      return this.$route.path === '/';
    },
  },
};
</script>

<style lang="scss">
.navbar-toggler {
  border :0;
  margin-left: 6px;

  &:active, &:focus {
    outline: 0;
  }
}

.no-transition {
  transition: none !important;
}

.overlay {
  overflow: hidden;
}

.trades {
  a { position: relative };

  .num {
    position: absolute;
    right: -15%;
    top: 10%;
    font-size: 10px;
    border-radius: 2px;
    -webkit-font-smoothing: subpixel-antialiased;
    color: #fff;
    background-color: #fa3e3e;
    text-align: center;
    min-width: 2em;
  }

  .dropdown-menu {
    right: 0;
    left: auto;
    top: 100%;
    padding: 0;
    width: 400px;
    font-size: 12px;
    user-select: none;

    .header {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
      background-color: #ffffff;
      padding: 7px 10px;
      border-bottom: 1px solid #e9e9e9;
      font-size: 12px;
      font-weight: 700;
      margin: 0;
    }

    .no-trades {
      text-align: center;
      margin: 0.5em;
    }

    .menu {
      padding: 0;
      list-style-type: none;
      max-height: 200px;
      overflow-x: hidden;

      .pad {
        padding: 10px;
      }

       li {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #e9e9e9;
        padding-left: 10px;

        &:hover {
          background: #f4f4f4;
        }

        p {
          display: block;
          flex: 1;
          white-space: pre-line;
          word-wrap: break-word;
          margin-bottom: 0;
        }

        .actions {
          display: flex;
          font-size: 1.2em;
          padding-left: 8px;

          a {
            display: flex;
            cursor: pointer;
            padding: 10px;
            height: 56px;
            align-items: center;

            &:hover {
              background-color: #dcdcdc;
              text-decoration: none;
            }

            .fa {
              &.fa-check { color: #4CAF50; }
              &.fa-times { color: #F44336; }
            }
          }
        }
      }
    }
  }
}

.trade-toggle-mobile {
  font-size: 1.2rem;
  position: relative;
  color: rgba(255, 255, 255, 0.5);

  &:hover, &:active {
    text-decoration: none;
    color: rgba(255, 255, 255, 0.5);
  }

  span {
    vertical-align: middle;
  }

  .num {
    position: absolute;
    right: -25%;
    top: -5%;
    font-size: 10px;
    border-radius: 2px;
    -webkit-font-smoothing: subpixel-antialiased;
    color: #fff;
    background-color: #fa3e3e;
    text-align: center;
    min-width: 2em;
  }
}

@media (max-width: 578px) {
  .trades {
    display: none;

    &.show { display: block; }

    .dropdown-menu {
      position: fixed;
      top: 56px;
      width: 100%;
      height: calc(100% - 56px);
      bottom: 0;
      overflow: scroll;
      border: 0;
      margin: 0;

      .menu { max-height: 100%; }
      .fa { font-size: 1.4em; }
    }
  }
}

@media (min-width: 576px) {
  .trade-toggle-mobile {
    display: none;
  }
}
</style>
