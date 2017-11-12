<template>
  <div class="container">
    <page-title></page-title>
    <div class="col-sm-12 col-md-6 mx-auto">
      <p class="text-center">If you do not have an account, one will be created with the credentials provided.</p>
      <b-form @submit.prevent="login()">
        <b-alert class="text-center" variant="danger" v-if="errorMessage" v-html="errorMessage" show></b-alert>
        <b-form-group>
          <b-form-input :state="errors.has('username') ? 'invalid' : null" name="username" placeholder="Username" v-model="form.username" :disabled="loading" v-validate="'required|min:1|max:16'" maxlength="16"></b-form-input>
          <b-form-feedback v-if="errors.has('username')">{{ errors.first('username') }}</b-form-feedback>
        </b-form-group>
        <b-form-group>
          <b-form-input :state="errors.has('password') ? 'invalid' : null" name="password" placeholder="Password" type="password" v-model="form.password" :disabled="loading" v-validate="'required|min:6|max:128'" maxlength="128"></b-form-input>
          <b-form-feedback v-if="errors.has('password')">{{ errors.first('password') }}</b-form-feedback>
        </b-form-group>
        <b-button type="submit" variant="primary" :block="true" :disabled="loading">
          <template v-if="loading">
            <span class="fa fa-circle-o-notch fa-spin" v-if="loading"></span> Signing In...
          </template>
          <template v-else>
            Sign In
          </template>
        </b-button>
        <hr/>
        <b-form-group>
          <b-button variant="info" :block="true" href="/api/v1/auth/github" :disabled="loading">
            <span class="fa fa-github"></span> Sign In with GitHub</b-button>
        </b-form-group>
        <b-form-group>
          <b-button variant="info" :block="true" href="/api/v1/auth/twitter" :disabled="loading">
            <span class="fa fa-twitter"></span> Sign In with Twitter</b-button>
        </b-form-group>
      </b-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'auth',
  data() {
    return {
      form: { username: '', password: '' },
      error: '',
      loading: false,
    };
  },
  created() {
    if (this.$route.query && this.$route.query.id && this.$route.query.token) {
      this.verifyToken(this.$route.query.id, this.$route.query.token);
    }
  },
  methods: {
    login() {
      if (this.loading) return;
      this.$validator.validateAll().then((result) => {
        if (result) {
          this.loading = true;
          this.error = null;
          this.$store.dispatch('login', this.form).then(() => {
            this.loading = false;
            this.form.username = '';
            this.form.password = '';
            this.$router.push(this.$store.getters.redirect);
          }).catch((err) => {
            if (err.response && err.response.data) {
              this.error = err.response.data;
            } else {
              this.error = 'Failed to log in';
            }
            this.loading = false;
          });
        }
      });
    },
    verifyToken(id, token) {
      this.$router.replace({ query: {} });
      this.$store.dispatch('verifyToken', { id, token }).then(() => {
        this.$router.push(this.$store.getters.redirect);
      }).catch(() => {
        this.error = 'Failed to validate token';
      });
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.loading) return next(false);
    this.error = null;
    this.errors.clear();
    return next();
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.$store.commit('redirect', from.fullPath);
    });
  },
  computed: {
    errorMessage() {
      if (typeof this.error === 'string') return this.error;
      else if (this.error instanceof Object) {
        return this.error.message;
      }
      return null;
    },
  },
};
</script>