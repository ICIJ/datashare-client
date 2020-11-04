<template>
  <div class="extensions h-100">
    <div class="container pt-4">
      <div class="d-flex mb-2">
        <div class="extensions__add ml-2">
          <b-btn variant="outline-primary" @click="$refs.installExtensionFromUrl.show()">
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
            <b-overlay :show="show" no-wrap></b-overlay>
          </b-modal>
        </div>
        <div class="extensions__search ml-auto">
          <search-form-control :placeholder="$t('extensions.search')" v-model="searchTerm" @input="search"></search-form-control>
        </div>
      </div>
      <b-card-group deck>
        <b-overlay :show="extension.show" v-for="extension in extensions" :key="extension.id" class="extensions__card m-3 d-flex">
          <b-card footer-border-variant="white" class="m-0">
            <b-card-text>
              <div class="d-flex">
                <div class="flex-grow-1">
                  <h4>{{ extension.name }}</h4>
                  <div>
                    {{ extension.description }}
                  </div>
                </div>
                <div class="d-flex flex-column text-nowrap pl-2">
                  <b-btn class="mb-2" @click="uninstallExtension(extension.id)" v-if="extension.installed" variant="danger">
                    <fa icon="trash-alt"></fa>
                    {{ $t('extensions.uninstall') }}
                  </b-btn>
                  <b-btn class="extensions__card__download-button mb-2" @click="installExtensionFromId(extension.id)" variant="primary" v-if="!extension.installed">
                    <fa icon="cloud-download-alt"></fa>
                    {{ $t('extensions.install') }}
                  </b-btn>
                  <b-btn class="extensions__card__download-button mb-2" @click="installExtensionFromId(extension.id)" variant="primary" v-if="extension.installed && extension.version !== extension.installedVersion" size="sm">
                    <fa icon="sync"></fa>
                    {{ $t('extensions.update') }}
                  </b-btn>
                  <div v-if="extension.installedVersion && extension.installed" class="text-muted text-center extensions__card__installed-version">
                    {{ $t('extensions.installedVersion', { version: extension.installedVersion  }) }}
                  </div>
                </div>
              </div>
            </b-card-text>

            <template v-slot:footer>
              <div v-if="extension.version" class="text-truncate w-100">
                <span class="font-weight-bold">
                  {{ $t('extensions.version') }}:
                </span>
                {{ extension.version }}
              </div>
              <div v-if="extension.url" class="text-truncate w-100">
                <span class="font-weight-bold">
                  {{ $t('extensions.homePage') }}:
                </span>
                <a :href="extension.url" target="_blank">
                  {{ extension.url }}
                </a>
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
      show: false,
      url: ''
    }
  },
  mounted () {
    this.search()
  },
  methods: {
    async search () {
      const extensions = await api.getExtensions(this.searchTerm)
      map(extensions, extension => { extension.show = false })
      this.$set(this, 'extensions', extensions)
    },
    async installExtensionFromId (extensionId) {
      const extension = find(this.extensions, { id: extensionId })
      extension.show = true
      try {
        await api.installExtensionFromId(extensionId)
        extension.installed = true
        this.$bvToast.toast(this.$t('extensions.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('extensions.submitError'), { noCloseButton: true, variant: 'danger' })
      }
      extension.show = false
    },
    async installExtensionFromUrl () {
      this.$set(this, 'show', true)
      try {
        await api.installExtensionFromUrl(this.url)
        await this.search()
        this.$bvToast.toast(this.$t('extensions.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('extensions.submitError'), { noCloseButton: true, variant: 'danger' })
      }
      this.$refs.installExtensionFromUrl.hide()
      this.$set(this, 'show', false)
      this.$set(this, 'url', '')
    },
    async uninstallExtension (extensionId) {
      const extension = find(this.extensions, { id: extensionId })
      extension.show = true
      try {
        await api.uninstallExtension(extensionId)
        extension.installed = false
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
  max-width: calc(50% - 2rem);
  min-width: calc(50% - 2rem);
  width: calc(50% - 2rem);

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
