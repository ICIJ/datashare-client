<template>
  <div class="api h-100">
    <page-header icon="plus" :title="$t('api.newApiKey')" :description="$t('api.subtitle')">
      <b-button @click="getApiKey" variant="primary" v-if="!apiKey">
        <fa icon="plus" class="mr-1"></fa>
        {{ $t('api.newApiKey') }}
      </b-button>
    </page-header>
    <div class="container pt-4">
      <div class="api__key row" v-if="apiKey">
        <div class="col-3 my-auto">
          {{ $t('api.apiKey') }}
        </div>
        <div class="col-6 my-auto text-center">
          {{ apiKey }}
        </div>
        <div class="col-3 text-right">
          <haptic-copy :text="apiKey" hide-label class="btn-link"></haptic-copy>
          <b-button class="api__key__create btn-link" @click="getApiKey" variant="none">
            <fa icon="redo"></fa>
          </b-button>
          <b-button class="api__key__delete btn-link" @click="deleteApiKey" variant="none">
            <fa icon="trash-alt"></fa>
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Api from '@/api'
import Auth from '@/api/resources/Auth'
import PageHeader from '@/components/PageHeader'

const api = new Api()
const auth = new Auth()

export default {
  name: 'Api',
  components: {
    PageHeader
  },
  data () {
    return {
      apiKey: null
    }
  },
  methods: {
    async getApiKey () {
      const userId = await auth.getUsername()
      const { apiKey } = await api.createApiKey(userId)
      this.$set(this, 'apiKey', apiKey)
    },
    async deleteApiKey () {
      const userId = await auth.getUsername()
      await api.deleteApiKey(userId)
      this.$set(this, 'apiKey', null)
    }
  }
}
</script>
