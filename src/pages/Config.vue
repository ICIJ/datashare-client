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
          :label="$t(`config.${field.name}`)"
          v-for="field in configFields"
          :key="field.name"
        >
          <b-form-radio-group
            v-if="field.type === 'boolean'"
            v-model="config[field.name]"
            :options="[{ text: 'Yes', value: true }, { text: 'No', value: false }]"
          ></b-form-radio-group>
          <b-form-input
            v-else
            v-model="config[field.name]"
            :type="field.type"
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
export default {
  name: 'Config',
  data () {
    return {
      config: {},
      configFields: [{
        name: 'oauthAuthorizeUrl',
        type: 'text'
      }, {
        name: 'dataSourceUrl',
        type: 'text'
      }, {
        name: 'oauthTokenUrl',
        type: 'text'
      }, {
        name: 'defaultUserName',
        type: 'text'
      }, {
        name: 'dataDir',
        type: 'text'
      }, {
        name: 'tcpListenPort',
        type: 'number'
      }, {
        name: 'oauthApiUrl',
        type: 'text'
      }, {
        name: 'clusterName',
        type: 'text'
      }, {
        name: 'defaultProject',
        type: 'text'
      }, {
        name: 'ocr',
        type: 'boolean'
      }]
    }
  },
  async created () {
    this.config = await this.$store.dispatch('config/getConfig')
  },
  methods: {
    async onSubmit () {
      await this.$store.dispatch('config/onSubmit', this.config)
    }
  }
}
</script>
