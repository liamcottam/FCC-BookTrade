/* eslint-disable */
import Vue from 'vue';
import VueRouter from 'vue-router';

const Home = () => import(/* webpackChunkName: "home" */ './pages/home');
const Error = () => import(/* webpackChunkName: "error" */ './pages/error');
const Auth = () => import(/* webpackChunkName: "auth" */ './pages/auth');
const Profile = () => import(/* webpackChunkName: "profile" */ './pages/profile');
const Settings = () => import(/* webpackChunkName: "settings" */ './pages/settings');
const AddBook = () => import(/* webpackChunkName: "addBook" */ './pages/addBook');
const Book = () => import(/* webpackChunkName: "book" */ './pages/book');
const CreateTrade = () => import(/* webpackChunkName: "createTrade" */ './pages/createTrade');

Vue.use(VueRouter);

const setTitle = (title) => {
  document.title = `${title} | ${process.env.APP_NAME}`;
};

const router = new VueRouter({
  mode: 'history',
  routes: [
    { path: '/', component: Home, meta: { title: 'Home', }, },
    { path: '/home/:term', component: Home, meta: { title: 'Home' } },
    { path: '/library', component: Profile, meta: { auth: true, title: 'My Library' } },
    { path: '/users/:username', component: Profile, meta: { auth: false } },
    { path: '/settings', component: Settings, meta: { auth: true, title: 'Settings' } },
    { path: '/add-book', component: AddBook, meta: { auth: true, title: 'Add Books' } },
    { path: '/trade/create/:id', component: CreateTrade, meta: { auth: true, title: 'Propose Trade' } },
    { path: '/books/:id', component: Book },
    {
      path: '/auth', component: Auth,
      meta: {
        title: 'Sign In',
        guest: true,
      },
    },
    { path: '*', component: Error, meta: { title: 'Not Found' } },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) setTitle(to.meta.title);
  if (to.meta.guest && router.app.$store.getters.authenticated) return next('/');
  if (to.meta.auth && !router.app.$store.getters.authenticated) return next('/auth');
  next();
});

export default router;
