<template>
  <div class="container settings">
    <div class="row">
      <div class="col-md-3" role="navigation">
        <nav class="menu">
          <h3 class="menu-heading">Personal settings</h3>
          <a class="menu-item selected">Account</a>
        </nav>
      </div>
      <div class="col-md-6">
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
          <b-button type="submit" variant="primary">Submit</b-button>
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
          <b-button type="submit" variant="primary">Submit</b-button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'settings',
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
};
</script>

<style lang="scss" scoped>

.subheading {
  display: -webkit-box;
  display: flex;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px #e1e4e8 solid;
  flex-flow: row wrap;

  h2 {
    font-size: 24px;
    font-weight: normal;
    -webkit-box-flex: 1;
    flex: 1 1 auto;
    margin-bottom: 0;
  }
}

.space {
  margin-top: 40px;
}

.settings {
  margin-top: 20px;
}

.menu {
  margin-bottom: 15px;
  background-color: rgb(255, 255, 255);
  list-style: none;
  border: 1px solid rgb(209, 213, 218);
  border-image: initial;

  .menu-heading {
    display: block;
    margin-top: 0;
    margin-bottom: 0;
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
    color: rgb(88, 96, 105);
    background-color: rgb(243, 245, 248);
    padding: 8px 10px;
    border-bottom: 1px solid rgb(225, 228, 232);
  }

  .menu-item {
    position: relative;
    display: block;
    padding: 8px 10px;
    border-bottom: 1px solid rgb(225, 228, 232);
    user-select: none;

    a {
      color: rgb(3, 102, 214);
      text-decoration: none;
      background-color: transparent;
    }
    a:focus,
    a:active {
      text-decoration: none;
    }
  }
  .menu-item:hover {
    background-color: rgb(246, 248, 250);
    text-decoration: none;
  }
  .menu-item:active,
  .menu-item:focus {
    text-decoration: none;
  }
  .menu-item.selected::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 2px;
    content: "";
    background-color: #15569f;
  }
  .menu-item.selected {
    font-weight: 600;
    color: rgb(36, 41, 46);
    cursor: default;
    background-color: rgb(255, 255, 255);
  }
  .menu-item:last-child {
    border-bottom-right-radius: 2px;
    border-bottom-left-radius: 2px;
    border-bottom: 0;
  }
}
</style>
