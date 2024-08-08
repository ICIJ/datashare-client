<template>
  <div class="extensions h-100">
    <div class="container pt-4">
      <div class="d-flex mb-2">
        <div class="extensions__add ms-2">
          <b-button variant="outline-primary" @click="$refs.installExtensionFromUrl.show()">
            <fa icon="link" class="me-1"></fa>
            {{ $t('extensions.installFromUrl') }}
          </b-button>
          <b-modal ref="installExtensionFromUrl" hide-footer lazy :title="$t('extensions.installFromUrl')">
            <b-overlay :show="isInstallingFromUrl">
              <div class="input-group mb-3">
                <span class="input-group-text bg-white">
                  <fa icon="link"></fa>
                </span>
                <b-form-input v-model="url" :state="isFormValid" placeholder="URL" type="url" />
              </div>
              <div class="d-flex align-items-center">
                <b-form-invalid-feedback class="text-primary" :state="isFormValid">
                  {{ $t('global.enterCorrectUrl') }}
                </b-form-invalid-feedback>
                <b-button
                  variant="action"
                  class="ms-auto text-nowrap"
                  :disabled="isFormValid !== true"
                  @click="installExtensionFromUrl"
                >
                  {{ $t('extensions.install') }}
                </b-button>
              </div>
            </b-overlay>
          </b-modal>
        </div>
        <div class="extensions__search ms-auto">
          <form-control-search v-model="searchTerm" :placeholder="$t('extensions.search')" @input="search" />
        </div>
      </div>
      <b-overlay :show="isLoading">
        <div class="row my-4">
          <b-overlay
            v-for="extension in extensions"
            :key="extension.id"
            :show="extension.loading"
            class="extensions__card col-6 mb-3"
          >
            <b-card footer-border-variant="white" class="m-0">
              <b-card-text>
                <div class="d-flex">
                  <div class="flex-grow-1">
                    <h4 class="extensions__card__name">
                      {{ getFormattedExtensionName(extension) }}
                    </h4>
                    <div class="extensions__card__description">
                      {{ getExtensionDescription(extension) }}
                    </div>
                  </div>
                  <div class="d-flex flex-column text-nowrap ps-2">
                    <b-button
                      v-if="extension.installed"
                      class="extensions__card__uninstall-button mb-2"
                      variant="danger"
                      @click="uninstallExtension(extension.id)"
                    >
                      <fa icon="trash-can"></fa>
                      {{ $t('extensions.uninstall') }}
                    </b-button>
                    <b-button
                      v-if="!extension.installed"
                      class="extensions__card__download-button mb-2"
                      variant="action"
                      @click="installExtensionFromId(extension.id)"
                    >
                      <fa icon="cloud-arrow-down"></fa>
                      {{ $t('extensions.install') }}
                    </b-button>
                    <b-button
                      v-if="hasAvailableUpdate(extension)"
                      class="extensions__card__update-button mb-2"
                      variant="action"
                      size="sm"
                      @click="installExtensionFromId(extension.id)"
                    >
                      <fa icon="arrows-rotate"></fa>
                      {{ $t('extensions.update') }}
                    </b-button>
                    <div
                      v-if="extension.version && extension.installed"
                      class="extensions__card__version text-muted text-center"
                    >
                      {{ $t('extensions.version', { version: extension.version }) }}
                    </div>
                  </div>
                </div>
              </b-card-text>
              <template v-if="isExtensionFromRegistry(extension)" #footer>
                <div class="extensions__card__official-version text-truncate w-100">
                  <span class="fw-bold"> {{ $t('extensions.officialVersion') }}: </span>
                  {{ extension.deliverableFromRegistry.version }}
                </div>
                <div class="text-truncate w-100">
                  <span class="fw-bold"> {{ $t('extensions.homePage') }}: </span>
                  <a
                    v-if="extension.deliverableFromRegistry.homepage"
                    class="extensions__card__homepage"
                    :href="extension.deliverableFromRegistry.homepage"
                    target="_blank"
                  >
                    {{ extension.deliverableFromRegistry.homepage }}
                  </a>
                </div>
              </template>
            </b-card>
          </b-overlay>
        </div>
      </b-overlay>
    </div>
  </div>
</template>

<script>
import { camelCase, find, get, startCase, uniqueId } from 'lodash'

import FormControlSearch from '@/components/Form/FormControl/FormControlSearch'
import { isUrl } from '@/utils/strings'

/**
 * A list of available extensions.
 */
export default {
  name: 'Extensions',
  components: {
    FormControlSearch
  },
  data() {
    return {
      extensions: [],
      searchTerm: '',
      isInstallingFromUrl: false,
      url: ''
    }
  },
  computed: {
    isFormValid() {
      return this.url === '' ? null : isUrl(this.url)
    },
    loaderId() {
      return uniqueId('extentions-loader-')
    },
    isLoading() {
      return this.$wait.is(this.loaderId)
    }
  },
  mounted() {
    this.search()
  },
  methods: {
    isExtensionFromRegistry(extension) {
      return get(extension, 'deliverableFromRegistry', false)
    },
    hasAvailableUpdate(extension) {
      return (
        extension.installed &&
        this.isExtensionFromRegistry(extension) &&
        extension.deliverableFromRegistry.version !== extension.version
      )
    },
    getFormattedExtensionName(extension) {
      if (this.isExtensionFromRegistry(extension)) {
        return extension.deliverableFromRegistry.name
      }
      return startCase(camelCase(extension.name))
    },
    getExtensionDescription(extension) {
      return this.isExtensionFromRegistry(extension)
        ? extension.deliverableFromRegistry.description
        : extension.description
    },
    async search() {
      this.$wait.start(this.loaderId)
      this.extensions = (await this.$core.api.getExtensions(this.searchTerm)).map((extension) => {
        return { ...extension, loading: false }
      })
      this.$wait.end(this.loaderId)
    },
    async installExtensionFromId(extensionId) {
      const extension = find(this.extensions, { id: extensionId })
      extension.loading = true
      try {
        await this.$core.api.installExtensionFromId(extensionId)
        extension.installed = true
        this.$toast.success(this.$t('extensions.submitSuccess'))
      } catch (_) {
        this.$toast.error(this.$t('extensions.submitError'))
      }
      extension.loading = false
    },
    async installExtensionFromUrl() {
      this.isInstallingFromUrl = true
      try {
        await this.$core.api.installExtensionFromUrl(this.url)
        await this.search()
        this.$toast.success(this.$t('extensions.submitSuccess'))
      } catch (_) {
        this.$toast.error(this.$t('extensions.submitError'))
      }
      this.$refs.installExtensionFromUrl.hide()
      this.isInstallingFromUrl = false
      this.url = ''
    },
    async uninstallExtension(extensionId) {
      const extension = find(this.extensions, { id: extensionId })
      extension.loading = true
      try {
        await this.$core.api.uninstallExtension(extensionId)
        extension.installed = false
        this.$toast.success(this.$t('extensions.deleteSuccess'))
      } catch (_) {
        this.$toast.error(this.$t('extensions.deleteError'))
      }
      extension.loading = false
    }
  }
}
</script>
