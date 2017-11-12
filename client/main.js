import 'babel-polyfill';
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VeeValidate from 'vee-validate';
import './assets/style.scss';

import App from './App';
import store from './store';
import router from './router';

import PageTitle from './components/PageTitle';
import Loading from './components/Loading';
import BookList from './components/BookList';

if (process.env.NODE_ENV !== 'production') {
  Vue.config.debug = true;
}
Vue.config.productionTip = false;

Vue.use(BootstrapVue);
Vue.use(VeeValidate, { enableAutoClasses: true });
Vue.mixin({
  created() {
    this.$appName = process.env.APP_NAME;
  },
});

Vue.component('page-title', PageTitle);
Vue.component('loading', Loading);
Vue.component('book-list', BookList);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App),
});
