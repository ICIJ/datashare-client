<template>
  <div class="plugins h-100">
    <div class="container pt-4">
      <div class="d-flex mb-2">
        <div class="plugins__add ms-2">
          <b-button variant="outline-primary" @click="$refs.installPluginFromUrl.show()">
            <fa icon="link" class="me-1" />
            {{ $t('plugins.installFromUrl') }}
          </b-button>
          <b-modal ref="installPluginFromUrl" hide-footer lazy :title="$t('plugins.installFromUrl')">
            <b-overlay :show="isInstallingFromUrl">
              <div class="input-group mb-3">
                <span class="input-group-text">
                  <fa icon="link" />
                </span>
                <b-form-input v-model="url" :state="isFormValid" class="b-form-control" placeholder="URL" type="url" />
              </div>
              <div class="d-flex align-items-center">
                <b-form-invalid-feedback class="text-primary" :state="isFormValid">
                  {{ $t('global.enterCorrectUrl') }}
                </b-form-invalid-feedback>
                <b-button
                  variant="action"
                  class="ms-auto text-nowrap"
                  :disabled="isFormValid !== true"
                  @click="installPluginFromUrl"
                >
                  {{ $t('plugins.install') }}
                </b-button>
              </div>
            </b-overlay>
          </b-modal>
        </div>
        <div class="plugins__search ms-auto">
          <search-form-control v-model="searchTerm" :placeholder="$t('plugins.search')" @input="search" />
        </div>
      </div>
      <b-overlay :show="isLoading">
        <div class="row my-4">
          <b-overlay v-for="plugin in plugins" :key="plugin.id" :show="plugin.loading" class="plugins__card col-6 mb-3">
            <b-card footer-border-variant="white">
              <b-card-text>
                <div class="d-flex">
                  <div class="flex-grow-1">
                    <h4 class="plugins__card__name">
                      {{ getPluginName(plugin) }}
                    </h4>
                    <div class="plugins__card__description">
                      {{ getPluginDescription(plugin) }}
                    </div>
                  </div>
                  <div class="d-flex flex-column text-nowrap ps-2">
                    <b-button
                      v-if="plugin.installed"
                      class="plugins__card__uninstall-button mb-2"
                      variant="danger"
                      @click="uninstallPlugin(plugin.id)"
                    >
                      <fa icon="trash-can"></fa>
                      {{ $t('plugins.uninstall') }}
                    </b-button>
                    <b-button
                      v-if="!plugin.installed"
                      class="plugins__card__download-button mb-2"
                      variant="action"
                      @click="installPluginFromId(plugin.id)"
                    >
                      <fa icon="cloud-arrow-down"></fa>
                      {{ $t('plugins.install') }}
                    </b-button>
                    <b-button
                      v-if="hasAvailableUpdate(plugin)"
                      class="plugins__card__update-button mb-2"
                      variant="action"
                      size="sm"
                      @click="installPluginFromId(plugin.id)"
                    >
                      <fa icon="arrows-rotate"></fa>
                      {{ $t('plugins.update') }}
                    </b-button>
                    <div
                      v-if="plugin.version && plugin.installed"
                      class="plugins__card__version text-muted text-center"
                    >
                      {{ $t('plugins.version', { version: plugin.version }) }}
                    </div>
                  </div>
                </div>
              </b-card-text>
              <template v-if="isPluginFromRegistry(plugin)" #footer>
                <div class="plugins__card__official-version text-truncate w-100">
                  <span class="fw-bold"> {{ $t('plugins.officialVersion') }}: </span>
                  {{ plugin.deliverableFromRegistry.version }}
                </div>
                <div class="text-truncate w-100">
                  <span class="fw-bold"> {{ $t('plugins.homePage') }}: </span>
                  <a
                    v-if="plugin.deliverableFromRegistry.homepage"
                    class="plugins__card__homepage"
                    :href="plugin.deliverableFromRegistry.homepage"
                    target="_blank"
                  >
                    {{ plugin.deliverableFromRegistry.homepage }}
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

import { isUrl } from '@/utils/strings'
import SearchFormControl from '@/components/SearchFormControl'

/**
 * A list of available plugins.
 */
export default {
  name: 'Plugins',
  components: {
    SearchFormControl
  },
  data() {
    return {
      plugins: [],
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
      return uniqueId('plugins-loader-')
    },
    isLoading() {
      return this.$wait.is(this.loaderId)
    }
  },
  mounted() {
    this.search()
  },
  methods: {
    isPluginFromRegistry(plugin) {
      return get(plugin, 'deliverableFromRegistry', false)
    },
    hasAvailableUpdate(plugin) {
      return (
        plugin.installed &&
        this.isPluginFromRegistry(plugin) &&
        plugin.deliverableFromRegistry.version !== plugin.version
      )
    },
    getPluginName(plugin) {
      if (this.isPluginFromRegistry(plugin)) {
        return plugin.deliverableFromRegistry.name
      }
      return startCase(camelCase(plugin.name))
    },
    getPluginDescription(plugin) {
      return this.isPluginFromRegistry(plugin) ? plugin.deliverableFromRegistry.description : plugin.description
    },
    async search() {
      this.$wait.start(this.loaderId)
      this.plugins = (await this.$core.api.getPlugins(this.searchTerm)).map((plugin) => {
        return { ...plugin, loading: false }
      })
      this.$wait.end(this.loaderId)
    },
    async installPluginFromId(pluginId) {
      const plugin = find(this.plugins, { id: pluginId })
      plugin.loading = true
      try {
        await this.$core.api.installPluginFromId(pluginId)
        plugin.installed = true
        this.$toast.success(this.$t('plugins.submitSuccess'))
      } catch (_) {
        this.$toast.error(this.$t('plugins.submitError'))
      }
      plugin.loading = false
    },
    async installPluginFromUrl() {
      this.isInstallingFromUrl = true
      try {
        await this.$core.api.installPluginFromUrl(this.url)
        await this.search()
        this.$toast.success(this.$t('plugins.submitSuccess'))
      } catch (_) {
        this.$toast.error(this.$t('plugins.submitError'))
      }
      this.$refs.installPluginFromUrl.hide()
      this.isInstallingFromUrl = false
      this.url = ''
    },
    async uninstallPlugin(pluginId) {
      const plugin = find(this.plugins, { id: pluginId })
      plugin.loading = true
      try {
        await this.$core.api.uninstallPlugin(pluginId)
        plugin.installed = false
        this.$toast.success(this.$t('plugins.deleteSuccess'))
      } catch (_) {
        this.$toast.error(this.$t('plugins.deleteError'))
      }
      plugin.loading = false
    }
  }
}
</script>
