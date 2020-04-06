<template>
  <div>
    <div v-if="!$config.is('multipleProjects')">
      <div class="bg-white">
        <div class="container py-5">
          <h3>{{ $t('config.title') }}</h3>
        </div>
      </div>
      <div class="container my-4">
        <v-wait for="load_data">
          <fa icon="circle-notch" spin size="2x" class="d-flex mx-auto mt-5" slot="waiting" />
          <b-form @submit.prevent="onSubmit">
            <b-form-group :label="name" v-for="(value, name) in config" :key="name" label-cols-xs="12" label-cols-sm="4" label-cols-lg="3">
              <b-form-input v-model="config[name]" />
            </b-form-group>
            <b-row>
              <b-col offset-xs="0" offset-sm="4" offset-lg="3">
                <b-button type="submit" variant="primary">
                  {{ $t('config.submit') }}
                </b-button>
              </b-col>
            </b-row>
          </b-form>
        </v-wait>
      </div>
    </div>
    <div v-else class="m-4">
      <b-alert variant="danger" show>
        {{ $t('config.noAccess') }}
      </b-alert>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Config',
  data () {
    return {
      config: {}
    }
  },
  async mounted () {
    this.$wait.start('load_data')
    const config = await this.$store.dispatch('config/getConfig')
    this.$set(this, 'config', config)
    this.$wait.end('load_data')
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
