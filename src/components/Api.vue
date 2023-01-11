<template>
  <div class="api h-100 container pt-4">
    <div v-if="isServer">
      <div v-if="!hasHashedKey" class="api__create-key card card-body text-center">
        <div class="mb-3">
          <fa icon="key" size="3x" />
        </div>
        <p class="lead" v-html="$t('api.key.why')"></p>
        <b-button variant="primary" @click="createApiKey">
          <fa icon="plus" class="mr-1"></fa>
          {{ $t('api.newApiKey') }}
        </b-button>
      </div>
      <div v-else>
        <p v-html="$t('api.key.description')"></p>
        <div class="card card-body">
          <div class="api__key d-flex align-items-center">
            <div class="text-center mx-3">
              <fa icon="key" size="2x" />
              <span class="d-block font-weight-bold text-uppercase">
                {{ $t('api.apiKey') }}
              </span>
            </div>
            <div class="flex-grow-1 mx-3">
              <span class="font-italic">
                {{ $t('api.key.unavailable') }}
              </span>
              –
              <a class="font-weight-bold text-link" href="#" @click.prevent="createApiKey">
                <fa icon="redo" />
                {{ $t('api.key.regenerate') }}
              </a>
            </div>
            <div class="mx-3">
              <confirm-button
                class="api__key__delete btn btn-outline-danger"
                :confirmed="deleteApiKey"
                :description="$t('api.key.delete.description')"
              >
                <fa icon="trash-alt" />
                {{ $t('api.key.delete.button') }}
              </confirm-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <b-alert variant="danger" show>
        {{ $t('api.noAccess') }}
      </b-alert>
    </div>
    <b-modal
      size="md"
      :title="$t('api.key.created')"
      :visible="hasApiKey"
      lazy
      ok-only
      body-class="p-0"
      footer-class="card-footer"
      @hidden="apiKey = null"
    >
      <div class="card-body border-top border-bottom">
        <p>
          {{ $t('api.key.warning') }}
        </p>
        <div class="input-group input-group-sm">
          <input class="form-control text-monospace" :value="apiKey" />
          <div class="input-group-append">
            <haptic-copy :text="apiKey" class="btn-outline-primary" label="Copy" />
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import utils from '@/mixins/utils'

/**
 * A page to manage user's API keys.
 */
export default {
  name: 'Api',
  mixins: [utils],
  data() {
    return {
      hashedKey: null,
      apiKey: null
    }
  },
  computed: {
    hasHashedKey() {
      return !!this.hashedKey
    },
    hasApiKey() {
      return !!this.apiKey
    }
  },
  async created() {
    await this.getHashedApiKey()
  },
  methods: {
    async getHashedApiKey() {
      const username = await this.$core.auth.getUsername()
      const { hashedKey } = await this.$core.api.getApiKey(username)
      this.hashedKey = hashedKey
    },
    async createApiKey() {
      const username = await this.$core.auth.getUsername()
      const { apiKey } = await this.$core.api.createApiKey(username) // why hash is not returned at the same time?
      this.apiKey = apiKey
      await this.getHashedApiKey()
    },
    async deleteApiKey() {
      const username = await this.$core.auth.getUsername()
      await this.$core.api.deleteApiKey(username)
      this.hashedKey = null
    }
  }
}
</script>

<style lang="scss">
.api {
  &__create-key {
    margin: auto;
    max-width: $modal-md;
  }
}
</style>
