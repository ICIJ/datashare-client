<template>
  <div>
    <div class="bg-white">
      <div class="container py-5">
        <h3>{{ $t('config.title') }}</h3>
      </div>
    </div>
    <div class="container mt-4">
      <b-form>
        <b-form-group
          :label="$t(`config.${field.name}`)"
          v-for="field in configFields"
          :key="field.name"
        >
          <b-form-radio-group
            v-if="field.type === 'boolean'"
            v-model="$config.values[field.name]"
            :options="[{ text: 'Yes', value: true }, { text: 'No', value: false }]"
            disabled
          ></b-form-radio-group>
          <b-form-input
            v-else
            v-model="$config.values[field.name]"
            :type="field.type"
            disabled
          ></b-form-input>
        </b-form-group>
      </b-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Config',
  data () {
    return {
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
  }
}
</script>
