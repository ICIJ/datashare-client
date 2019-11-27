<template>
  <div>
    <div class="bg-white">
      <div class="container py-5">
        <h3>Configuration</h3>
      </div>
    </div>
    <div class="container mt-4">
      <b-form>
        <b-form-group
          :label="field"
          v-for="field in configFields"
          :key="field"
        >
          <b-form-input
            v-model="$config.values[field]"
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
      configFields: ['oauthAuthorizeUrl', 'dataSourceUrl', 'oauthTokenUrl', 'defaultUserName', 'dataDir', 'tcpListenPort', 'oauthApiUrl', 'clusterName', 'defaultProject', 'ocr']
    }
  }
}
</script>
