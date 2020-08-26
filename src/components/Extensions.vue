<template>
  <div class="extensions h-100">
    <div class="container pt-4">
      <div class="d-flex mb-2">
        <div class="extensions__search flex-grow-1">
          <search-form-control :placeholder="$t('extensions.search')" v-model="searchTerm" @input="search"></search-form-control>
        </div>
        <div class="extensions__add ml-2">
          <b-btn variant="primary" @click="$refs.installExtensionFromUrl.show()">
            <fa icon="link" class="mr-1"></fa>
            {{ $t('extensions.installFromUrl') }}
          </b-btn>
          <b-modal ref="installExtensionFromUrl" hide-footer id="extensions__add__modal">
            <template #modal-title>
              <fa icon="link" class="mr-1"></fa>
              {{ $t('extensions.installFromUrl') }}
            </template>
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text rounded-0 border-0 bg-white">
                  <fa icon="link"></fa>
                </span>
              </div>
              <b-form-input type="url" class="b-form-control border-0" required placeholder="URL" v-model="url" :state="isUrl(url)"></b-form-input>
              <b-form-invalid-feedback class="text-secondary mt-2">
                {{ $t('global.enterCorrectUrl') }}
              </b-form-invalid-feedback>
            </div>
            <b-btn variant="primary" class="float-right" @click="installExtensionFromUrl">
              {{ $t('extensions.install') }}
            </b-btn>
          </b-modal>
        </div>
      </div>
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
                <b-btn class="ml-2" @click="uninstallExtension(extension.id)" :title="$t('extensions.uninstall')">
                  <fa icon="trash-alt"></fa>
                </b-btn>
              </div>
            </template>
          </b-card>
        </b-overlay>
      </b-card-group>
    </div>
  </div>
</template>

<script>
import find from 'lodash/find'
import map from 'lodash/map'

import Api from '@/api'
import SearchFormControl from '@/components/SearchFormControl'
import { isUrl } from '@/utils/strings'

const api = new Api()

export default {
  name: 'Extensions',
  components: {
    SearchFormControl
  },
  data () {
    return {
      extensions: [],
      searchTerm: '',
      url: ''
    }
  },
  async mounted () {
    const extensions = await api.getExtensions()
    map(extensions, extension => { extension.show = false })
    this.$set(this, 'extensions', extensions)
  },
  methods: {
    async search () {
      const extensions = await api.getExtensions(this.searchTerm)
      this.$set(this, 'extensions', extensions)
    },
    async installExtensionFromId (extensionId) {
      const extension = find(this.extensions, { id: extensionId })
      extension.show = true
      try {
        await api.installExtensionFromId(extensionId)
        this.$bvToast.toast(this.$t('extensions.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('extensions.submitError'), { noCloseButton: true, variant: 'danger' })
      }
      extension.show = false
    },
    async installExtensionFromUrl () {
      try {
        await api.installExtensionFromUrl(this.url)
        this.$bvToast.toast(this.$t('extensions.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('extensions.submitError'), { noCloseButton: true, variant: 'danger' })
      }
      this.$refs.installExtensionFromUrl.hide()
      this.$set(this, 'url', '')
    },
    async uninstallExtension (extensionId) {
      const extension = find(this.extensions, { id: extensionId })
      extension.show = true
      try {
        await api.uninstallExtension(extensionId)
        this.$bvToast.toast(this.$t('extensions.deleteSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('extensions.deleteError'), { noCloseButton: true, variant: 'danger' })
      }
      extension.show = false
    },
    isUrl
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
