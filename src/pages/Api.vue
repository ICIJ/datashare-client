<template>
  <div class="api h-100">
    <div class="api__explanation bg-white py-5">
      <div class="container">
        <b-button @click="getApiKey" variant="primary" class="float-right" v-if="!apiKey">
          <fa icon="plus" class="mr-1"></fa>
          {{ $t('api.newApiKey') }}
        </b-button>
        <h3>
          <page-icon icon="plug"></page-icon>
          {{ $t('api.title') }}
        </h3>
        <p class="m-0">
          {{ $t('api.subtitle') }}
        </p>
      </div>
    </div>
    <div class="container pt-4">
      <div class="row" v-if="apiKey">
        <div class="col-sm my-auto">
          {{ $t('api.apiKey') }}
        </div>
        <div class="col-sm my-auto">
          {{ apiKey }}
        </div>
        <div class="col-sm">
          <haptic-copy :text="apiKey" hide-label class="float-right btn-link"></haptic-copy>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Api from '@/api'
import PageIcon from '@/components/PageIcon'

const api = new Api()

export default {
  name: 'Api',
  components: {
    PageIcon
  },
  data () {
    return {
      apiKey: null
    }
  },
  methods: {
    async getApiKey () {
      const { apiKey } = await api.createApiKey()
      this.$set(this, 'apiKey', apiKey)
    }
  }
}
</script>
