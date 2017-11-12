<template>
  <settings>
    <form v-on:submit.prevent="submitChangeUsername" data-vv-scope="changeUsername">
      <div class="subheading">
        <h2 >Change username</h2>
      </div>
      <b-alert class="text-center" variant="success" v-show="changeUsername.success" v-html="changeUsername.success" show></b-alert>
      <b-alert class="text-center" variant="danger" v-show="changeUsername.error" v-html="changeUsername.error" show></b-alert>
      <b-form-group id="username" label="Username">
        <b-form-input :state="errors.has('changeUsername.username') ? 'invalid' : null"  name="username" placeholder="Enter your new username" v-model="changeUsername.username" v-validate="'required|min:3|max:16'" maxlength="16"></b-form-input>
        <b-form-feedback v-if="errors.has('changeUsername.username')">{{ errors.first('changeUsername.username') }}</b-form-feedback>
      </b-form-group>
      <b-button type="submit">Change username</b-button>
    </form>
    <form v-on:submit.prevent="submitChangePassword" data-vv-scope="changePassword">
      <div class="subheading space">
        <h2>Change password</h2>
      </div>
      <b-alert class="text-center" variant="success" v-show="changePassword.success" v-html="changePassword.success" show></b-alert>
      <b-alert class="text-center" variant="danger" v-show="changePassword.error" v-html="changePassword.error" show></b-alert>
      <b-form-group id="current_password" label="Current Password">
        <b-form-input :state="errors.has('changePassword.current_password') ? 'invalid' : null"  name="current_password" placeholder="Enter your current password" type="password" v-model="changePassword.current_password" data-vv-as="current password" v-validate="'required|min:6|max:128'" maxlength="128"></b-form-input>
        <b-form-feedback v-if="errors.has('changePassword.current_password')">{{ errors.first('changePassword.current_password') }}</b-form-feedback>
      </b-form-group>
      <b-form-group id="new_password" label="New Password">
        <b-form-input :state="errors.has('changePassword.new_password') ? 'invalid' : null"  name="new_password" placeholder="Enter your new password" type="password" v-model="changePassword.new_password" data-vv-as="new password" v-validate="'required|min:6|max:128'" maxlength="128"></b-form-input>
        <b-form-feedback v-if="errors.has('changePassword.new_password')">{{ errors.first('changePassword.new_password') }}</b-form-feedback>
      </b-form-group>
      <b-form-group id="confirm_password" label="Confirm New Password">
        <b-form-input :state="errors.has('changePassword.confirm_password') ? 'invalid' : null"  name="confirm_password" placeholder="Confirm your new password" type="password" v-model="changePassword.confirm_password" data-vv-as="confirm password" v-validate="'required|min:6|max:128'" maxlength="128"></b-form-input>
        <b-form-feedback v-if="errors.has('changePassword.confirm_password')">{{ errors.first('changePassword.confirm_password') }}</b-form-feedback>
      </b-form-group>
      <b-button type="submit">Change password</b-button>
    </form>
  </settings>
</template>

<script>
import Settings from '@/components/Settings';

export default {
  name: 'account-settings',
  data() {
    return {
      changePassword: {
        error: null,
        success: null,
        current_password: '',
        new_password: '',
        confirm_password: '',
      },
      changeUsername: {
        error: null,
        success: null,
        username: '',
      },
    };
  },
  methods: {
    submitChangePassword() {
      this.errors.clear('changePassword');
      this.changePassword.error = null;
      this.changePassword.success = null;
      this.$validator.validateAll('changePassword').then((result) => {
        if (this.changePassword.current_password === this.changePassword.new_password) {
          this.error = 'Your new password cannot be the same as your current password.';
        } else if (result) {
          this.$store.dispatch('changePassword', {
            old_password: this.changePassword.current_password,
            new_password: this.changePassword.new_password,
          }).then(() => {
            this.changePassword.current_password = '';
            this.changePassword.new_password = '';
            this.changePassword.confirm_password = '';
            this.changePassword.success = 'Password changed!';
            this.$nextTick(() => {
              this.errors.clear('changePassword');
            });
          }).catch((err) => {
            if (err.response.data.msg) {
              this.changePassword.success = err.response.data.msg;
            } else {
              this.changePassword.success = 'Failed to change password';
            }
          });
        }
      });
    },
    submitChangeUsername() {
      this.errors.clear('changeUsername');
      this.changeUsername.error = null;
      this.changeUsername.success = null;
      this.$validator.validateAll('changeUsername').then((result) => {
        if (result) {
          this.$store.dispatch('changeUsername', this.changeUsername.username).then(() => {
            this.changeUsername.username = '';
            this.changeUsername.success = 'Username changed!';
            this.$nextTick(() => {
              this.errors.clear('changeUsername');
            });
          }).catch((err) => {
            if (err.response.data.msg) {
              this.changeUsername.error = err.response.data.msg;
            } else {
              this.changeUsername.error = 'Failed to change username';
            }
          });
        }
      });
    },
  },
  components: {
    settings: Settings,
  },
};
</script>
