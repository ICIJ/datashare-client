<template>
  <div class="extensions h-100">
    <b-card-group deck>
      <b-overlay :show="extension.show" v-for="extension in extensions" :key="extension.id" class="extensions__card mx-3">
        <b-card :header="extension.name" footer-bg-variant="white" footer-border-variant="white" class="m-0">
          <b-card-text>
            <div>
              {{ extension.description }}
            </div>
            <div v-if="extension.version" class="font-italic mt-2">
              {{ $t('extensions.version') }}: {{ extension.version }}
            </div>
          </b-card-text>
          <template v-slot:footer>
            <div class="text-center">
              <b-btn :href="extension.url" target="_blank" :title="$t('extensions.homePage')" v-if="extension.url">
                <fa icon="home"></fa>
              </b-btn>
              <b-btn class="ml-2" @click="installExtensionFromId(extension.id)" :title="$t('extensions.install')">
                <fa icon="cloud-upload-alt"></fa>
              </b-btn>
            </div>
          </template>
        </b-card>
      </b-overlay>
    </b-card-group>
  </div>
</template>

<script>
import find from 'lodash/find'
import map from 'lodash/map'

import Api from '@/api'

const api = new Api()

export default {
  name: 'Extensions',
  data () {
    return {
      extensions: []
    }
  },
  async mounted () {
    const extensions = await api.getExtensions()
    map(extensions, extension => { extension.show = false })
    this.$set(this, 'extensions', extensions)
  },
  methods: {
    async installExtensionFromId (extensionId) {
      const extension = find(this.extensions, { id: extensionId })
      try {
        extension.show = true
        await api.installExtensionFromId(extensionId)
        this.$bvToast.toast(this.$t('extensions.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('extensions.submitError'), { noCloseButton: true, variant: 'danger' })
      }
      extension.show = false
    }
  }
}
</script>

<style lang="scss">
.extensions__card {
  max-width: calc(25% - 2rem);
  min-width: calc(25% - 2rem);
  width: calc(25% - 2rem);

  .card-header {
    font-weight: bold;
  }
}

#extensions__add__modal {
  .modal-body {
    background: darken($primary, 20);
    color: white;
  }
}
</style>
