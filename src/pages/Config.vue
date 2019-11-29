<template>
  <div>
    <div class="bg-white">
      <div class="container py-5">
        <h3>{{ $t('config.title') }}</h3>
      </div>
    </div>
    <div class="container my-4">
      <b-form @submit.prevent="onSubmit">
        <b-form-group
          :label="name"
          v-for="(value, name) in config"
          :key="name"
        >
          <b-form-input
            v-model="config[name]"
          ></b-form-input>
        </b-form-group>
        <b-button type="submit" variant="primary">
          {{ $t('config.submit') }}
        </b-button>
      </b-form>
    </div>
  </div>
</template>

<script>
import omit from 'lodash/omit'

export default {
  name: 'Config',
  data () {
    return {
      config: {}
    }
  },
  async created () {
    this.config = omit(await this.$store.dispatch('config/getConfig'), 'userProjects')
  },
  methods: {
    async onSubmit () {
      try {
        await this.$store.dispatch('config/onSubmit', this.config)
        this.$bvToast.toast(this.$t('config.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('config.submitError'), { noCloseButton: true, variant: 'danger' })
      }
    }
  }
}
</script>
