<template>
  <settings>
    <form v-on:submit.prevent="submitChangeProfile" data-vv-scope="changeProfile">
      <div class="subheading">
        <h2>Public profile</h2>
      </div>
      <b-alert class="text-center" variant="success" v-show="changeProfile.success" v-html="changeProfile.success" show></b-alert>
      <b-alert class="text-center" variant="danger" v-show="changeProfile.error" v-html="changeProfile.error" show></b-alert>
      <b-form-group id="name" label="Name">
        <b-form-input :state="errors.has('changeProfile.name') ? 'invalid' : null"  name="name" v-model="changeProfile.name" v-validate="'max:128'" maxlength="128"></b-form-input>
        <b-form-feedback v-if="errors.has('changeProfile.name')">{{ errors.first('changeProfile.name') }}</b-form-feedback>
      </b-form-group>
      <b-form-group id="city" label="City">
        <b-form-input :state="errors.has('changeProfile.city') ? 'invalid' : null"  name="city" v-model="changeProfile.city" v-validate="'max:128'" maxlength="128"></b-form-input>
        <b-form-feedback v-if="errors.has('changeProfile.city')">{{ errors.first('changeProfile.city') }}</b-form-feedback>
      </b-form-group>
      <b-form-group id="state" label="State">
        <b-form-input :state="errors.has('changeProfile.state') ? 'invalid' : null"  name="state" v-model="changeProfile.state" v-validate="'max:128'" maxlength="128"></b-form-input>
        <b-form-feedback v-if="errors.has('changeProfile.state')">{{ errors.first('changeProfile.state') }}</b-form-feedback>
      </b-form-group>
      <b-button type="submit" variant="success">Update profile</b-button>
    </form>
  </settings>
</template>

<script>
import { mapGetters } from 'vuex';
import Settings from '@/components/Settings';

export default {
  name: 'profile-settings',
  components: {
    settings: Settings,
  },
  data() {
    return {
      changeProfile: {
        error: null,
        success: null,
        name: '',
        city: '',
        state: '',
      },
    };
  },
  created() {
    this.changeProfile.name = this.name;
    this.changeProfile.city = this.city;
    this.changeProfile.state = this.state;
  },
  methods: {
    submitChangeProfile() {
      this.errors.clear('changeProfile');
      this.changeProfile.error = null;
      this.changeProfile.success = null;
      this.$validator.validateAll('changeProfile').then((result) => {
        if (result) {
          this.$store.dispatch('updateProfile', {
            name: this.changeProfile.name,
            city: this.changeProfile.city,
            state: this.changeProfile.state,
          }).then(() => {
            this.changeProfile.username = '';
            this.changeProfile.success = 'Profile updated!';
            this.$nextTick(() => {
              this.errors.clear('changeProfile');
            });
          }).catch((err) => {
            if (err.response.data && err.response.data.msg) {
              this.changeProfile.error = err.response.data.msg;
            } else {
              this.changeProfile.error = 'Failed to update profile';
            }
          });
        }
      });
    },
  },
  computed: {
    ...mapGetters([
      'name',
      'city',
      'state',
    ]),
  },
};
</script>
