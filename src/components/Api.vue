<template>
  <div class="api h-100 container pt-4">
    <div v-if="isServer">
      <div v-if="!hasHashedKey" class="api__create-key card card-body text-center">
        <div class="mb-3">
          <fa icon="key" size="3x" />
        </div>
        <p class="lead" v-html="$t('api.key.why')"></p>
        <b-button variant="primary" @click="createApiKey">
          <fa icon="plus" class="me-1"></fa>
          {{ $t('api.newApiKey') }}
        </b-button>
      </div>
      <div v-else>
        <p v-html="$t('api.key.description')"></p>
        <div class="card card-body">
          <div class="api__key d-flex align-items-center">
            <div class="text-center mx-3">
              <fa icon="key" size="2x" />
              <span class="d-block fw-bold text-uppercase">
                {{ $t('api.apiKey') }}
              </span>
            </div>
            <div class="flex-grow-1 mx-3">
              <span class="font-italic">
                {{ $t('api.key.unavailable') }}
              </span>
              –
              <a class="fw-bold text-link" href="#" @click.prevent="createApiKey">
                <fa icon="arrow-rotate-right" />
                {{ $t('api.key.regenerate') }}
              </a>
            </div>
            <div class="mx-3">
              <confirm-button
                class="api__key__delete btn btn-outline-danger"
                :confirmed="deleteApiKey"
                :description="$t('api.key.delete.description')"
              >
                <fa icon="trash-can" />
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
      :model-value="showModal"
      lazy
      ok-only
      footer-class="bg-light rounded-bottom border-top py-2 px-3"
      @hidden="apiKey = null"
    >
      <p>{{ $t('api.key.warning') }}</p>
      <div class="input-group input-group-sm">
        <input class="form-control font-monospace." readonly :value="apiKey" />
        <haptic-copy :text="apiKey" class="btn-outline-primary" label="Copy" />
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
    showModal() {
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
      const { apiKey } = await this.$core.api.createApiKey(username)
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
