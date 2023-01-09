<template>
  <div class="extensions h-100">
    <div class="container pt-4">
      <div class="d-flex mb-2">
        <div class="extensions__add ml-2">
          <b-btn variant="outline-primary" @click="$refs.installExtensionFromUrl.show()">
            <fa icon="link" class="mr-1"></fa>
            {{ $t('extensions.installFromUrl') }}
          </b-btn>
          <b-modal ref="installExtensionFromUrl" hide-footer lazy>
            <template #modal-title>
              {{ $t('extensions.installFromUrl') }}
            </template>
            <b-overlay :show="isInstallingFromUrl">
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text bg-white">
                    <fa icon="link"></fa>
                  </span>
                </div>
                <b-form-input :state="isFormValid" placeholder="URL" type="url" v-model="url" />
              </div>
              <div class="d-flex align-items-center">
                <b-form-invalid-feedback class="text-secondary" :state="isFormValid">
                  {{ $t('global.enterCorrectUrl') }}
                </b-form-invalid-feedback>
                <b-btn
                  variant="primary"
                  class="ml-auto text-nowrap"
                  @click="installExtensionFromUrl"
                  :disabled="isFormValid !== true"
                >
                  {{ $t('extensions.install') }}
                </b-btn>
              </div>
            </b-overlay>
          </b-modal>
        </div>
        <div class="extensions__search ml-auto">
          <search-form-control
            :placeholder="$t('extensions.search')"
            v-model="searchTerm"
            @input="search"
          ></search-form-control>
        </div>
      </div>
      <b-card-group deck>
        <b-overlay
          :show="extension.show"
          v-for="extension in extensions"
          :key="extension.id"
          class="extensions__card m-3 d-flex"
        >
          <b-card footer-border-variant="white" class="m-0">
            <b-card-text>
              <div class="d-flex">
                <div class="flex-grow-1">
                  <h4 class="extensions__card__name">
                    {{ getExtensionName(extension) | camelCase | startCase }}
                  </h4>
                  <div class="extensions__card__description">
                    {{ getExtensionDescription(extension) }}
                  </div>
                </div>
                <div class="d-flex flex-column text-nowrap pl-2">
                  <b-btn
                    class="extensions__card__uninstall-button mb-2"
                    @click="uninstallExtension(extension.id)"
                    v-if="extension.installed"
                    variant="danger"
                  >
                    <fa icon="trash-alt"></fa>
                    {{ $t('extensions.uninstall') }}
                  </b-btn>
                  <b-btn
                    class="extensions__card__download-button mb-2"
                    @click="installExtensionFromId(extension.id)"
                    variant="primary"
                    v-if="!extension.installed"
                  >
                    <fa icon="cloud-download-alt"></fa>
                    {{ $t('extensions.install') }}
                  </b-btn>
                  <b-btn
                    class="extensions__card__update-button mb-2"
                    @click="installExtensionFromId(extension.id)"
                    variant="primary"
                    v-if="
                      extension.installed &&
                      isExtensionFromRegistry(extension) &&
                      extension.version !== extension.deliverableFromRegistry.version
                    "
                    size="sm"
                  >
                    <fa icon="sync"></fa>
                    {{ $t('extensions.update') }}
                  </b-btn>
                  <div
                    v-if="extension.version && extension.installed"
                    class="extensions__card__version text-muted text-center"
                  >
                    {{ $t('extensions.version', { version: extension.version }) }}
                  </div>
                </div>
              </div>
            </b-card-text>
            <template #footer v-if="isExtensionFromRegistry(extension)">
              <div class="extensions__card__official-version text-truncate w-100">
                <span class="font-weight-bold"> {{ $t('extensions.officialVersion') }}: </span>
                {{ extension.deliverableFromRegistry.version }}
              </div>
              <div class="text-truncate w-100">
                <span class="font-weight-bold"> {{ $t('extensions.homePage') }}: </span>
                <a
                  class="extensions__card__homepage"
                  :href="extension.deliverableFromRegistry.homepage"
                  target="_blank"
                  v-if="extension.deliverableFromRegistry.homepage"
                >
                  {{ extension.deliverableFromRegistry.homepage }}
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
import { camelCase, find, get, map, startCase } from 'lodash'

import SearchFormControl from '@/components/SearchFormControl'
import { isUrl } from '@/utils/strings'

/**
 * A list of available extensions.
 */
export default {
  name: 'Extensions',
  components: {
    SearchFormControl
  },
  data() {
    return {
      extensions: [],
      searchTerm: '',
      isInstallingFromUrl: false,
      url: ''
    }
  },
  mounted() {
    this.search()
  },
  filters: {
    camelCase,
    startCase
  },
  methods: {
    isExtensionFromRegistry(extension) {
      return get(extension, 'deliverableFromRegistry', false)
    },
    getExtensionName(extension) {
      return this.isExtensionFromRegistry(extension) ? extension.deliverableFromRegistry.name : extension.name
    },
    getExtensionDescription(extension) {
      return this.isExtensionFromRegistry(extension)
        ? extension.deliverableFromRegistry.description
        : extension.description
    },
    async search() {
      const extensions = await this.$core.api.getExtensions(this.searchTerm)
      map(extensions, (extension) => {
        extension.show = false
      })
      this.$set(this, 'extensions', extensions)
    },
    async installExtensionFromId(extensionId) {
      const extension = find(this.extensions, { id: extensionId })
      extension.show = true
      try {
        await this.$core.api.installExtensionFromId(extensionId)
        extension.installed = true
        this.$bvToast.toast(this.$t('extensions.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('extensions.submitError'), { noCloseButton: true, variant: 'danger' })
      }
      extension.show = false
    },
    async installExtensionFromUrl() {
      this.$set(this, 'isInstallingFromUrl', true)
      try {
        await this.$core.api.installExtensionFromUrl(this.url)
        await this.search()
        this.$bvToast.toast(this.$t('extensions.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('extensions.submitError'), { noCloseButton: true, variant: 'danger' })
      }
      this.$refs.installExtensionFromUrl.hide()
      this.$set(this, 'isInstallingFromUrl', false)
      this.$set(this, 'url', '')
    },
    async uninstallExtension(extensionId) {
      const extension = find(this.extensions, { id: extensionId })
      extension.show = true
      try {
        await this.$core.api.uninstallExtension(extensionId)
        extension.installed = false
        this.$bvToast.toast(this.$t('extensions.deleteSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('extensions.deleteError'), { noCloseButton: true, variant: 'danger' })
      }
      extension.show = false
    }
  },
  computed: {
    isFormValid() {
      return this.url === '' ? null : isUrl(this.url)
    }
  }
}
</script>

<style lang="scss" scoped>
.extensions__card {
  max-width: calc(50% - 2rem);
  min-width: calc(50% - 2rem);
  width: calc(50% - 2rem);

  .card-header {
    font-weight: bold;
  }
}
</style>
