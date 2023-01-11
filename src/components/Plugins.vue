<template>
  <div class="plugins h-100">
    <div class="container pt-4">
      <div class="d-flex mb-2">
        <div class="plugins__add ml-2">
          <b-btn variant="outline-primary" @click="$refs.installPluginFromUrl.show()">
            <fa icon="link" class="mr-1" />
            {{ $t('plugins.installFromUrl') }}
          </b-btn>
          <b-modal ref="installPluginFromUrl" hide-footer lazy>
            <template #modal-title>
              {{ $t('plugins.installFromUrl') }}
            </template>
            <b-overlay :show="isInstallingFromUrl">
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text">
                    <fa icon="link" />
                  </span>
                </div>
                <b-form-input v-model="url" :state="isFormValid" class="b-form-control" placeholder="URL" type="url" />
              </div>
              <div class="d-flex align-items-center">
                <b-form-invalid-feedback class="text-secondary" :state="isFormValid">
                  {{ $t('global.enterCorrectUrl') }}
                </b-form-invalid-feedback>
                <b-btn
                  variant="primary"
                  class="ml-auto text-nowrap"
                  :disabled="isFormValid !== true"
                  @click="installPluginFromUrl"
                >
                  {{ $t('plugins.install') }}
                </b-btn>
              </div>
            </b-overlay>
          </b-modal>
        </div>
        <div class="plugins__search ml-auto">
          <search-form-control v-model="searchTerm" :placeholder="$t('plugins.search')" @input="search" />
        </div>
      </div>
      <b-card-group deck>
        <b-overlay v-for="plugin in plugins" :key="plugin.id" :show="plugin.show" class="plugins__card m-3 d-flex">
          <b-card footer-border-variant="white" class="m-0">
            <b-card-text>
              <div class="d-flex">
                <div class="flex-grow-1">
                  <h4 class="plugins__card__name">
                    {{ getPluginName(plugin) | camelCase | startCase }}
                  </h4>
                  <div class="plugins__card__description">
                    {{ getPluginDescription(plugin) }}
                  </div>
                </div>
                <div class="d-flex flex-column text-nowrap pl-2">
                  <b-btn
                    v-if="plugin.installed"
                    class="plugins__card__uninstall-button mb-2"
                    variant="danger"
                    @click="uninstallPlugin(plugin.id)"
                  >
                    <fa icon="trash-alt"></fa>
                    {{ $t('plugins.uninstall') }}
                  </b-btn>
                  <b-btn
                    v-if="!plugin.installed"
                    class="plugins__card__download-button mb-2"
                    variant="primary"
                    @click="installPluginFromId(plugin.id)"
                  >
                    <fa icon="cloud-download-alt"></fa>
                    {{ $t('plugins.install') }}
                  </b-btn>
                  <b-btn
                    v-if="
                      plugin.installed &&
                      isPluginFromRegistry(plugin) &&
                      plugin.version !== plugin.deliverableFromRegistry.version
                    "
                    class="plugins__card__update-button mb-2"
                    variant="primary"
                    size="sm"
                    @click="installPluginFromId(plugin.id)"
                  >
                    <fa icon="sync"></fa>
                    {{ $t('plugins.update') }}
                  </b-btn>
                  <div v-if="plugin.version && plugin.installed" class="plugins__card__version text-muted text-center">
                    {{ $t('plugins.version', { version: plugin.version }) }}
                  </div>
                </div>
              </div>
            </b-card-text>
            <template v-if="isPluginFromRegistry(plugin)" #footer>
              <div class="plugins__card__official-version text-truncate w-100">
                <span class="font-weight-bold"> {{ $t('plugins.officialVersion') }}: </span>
                {{ plugin.deliverableFromRegistry.version }}
              </div>
              <div class="text-truncate w-100">
                <span class="font-weight-bold"> {{ $t('plugins.homePage') }}: </span>
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
      </b-card-group>
    </div>
  </div>
</template>

<script>
import { camelCase, find, get, map, startCase } from 'lodash'
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
  filters: {
    camelCase,
    startCase
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
    }
  },
  mounted() {
    this.search()
  },
  methods: {
    isPluginFromRegistry(plugin) {
      return get(plugin, 'deliverableFromRegistry', false)
    },
    getPluginName(plugin) {
      return this.isPluginFromRegistry(plugin) ? plugin.deliverableFromRegistry.name : plugin.name
    },
    getPluginDescription(plugin) {
      return this.isPluginFromRegistry(plugin) ? plugin.deliverableFromRegistry.description : plugin.description
    },
    async search() {
      const plugins = await this.$core.api.getPlugins(this.searchTerm)
      map(plugins, (plugin) => {
        plugin.show = false
      })
      this.$set(this, 'plugins', plugins)
    },
    async installPluginFromId(pluginId) {
      const plugin = find(this.plugins, { id: pluginId })
      plugin.show = true
      try {
        await this.$core.api.installPluginFromId(pluginId)
        plugin.installed = true
        this.$bvToast.toast(this.$t('plugins.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('plugins.submitError'), { noCloseButton: true, variant: 'danger' })
      }
      plugin.show = false
    },
    async installPluginFromUrl() {
      this.$set(this, 'isInstallingFromUrl', true)
      try {
        await this.$core.api.installPluginFromUrl(this.url)
        await this.search()
        this.$bvToast.toast(this.$t('plugins.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('plugins.submitError'), { noCloseButton: true, variant: 'danger' })
      }
      this.$refs.installPluginFromUrl.hide()
      this.$set(this, 'isInstallingFromUrl', false)
      this.$set(this, 'url', '')
    },
    async uninstallPlugin(pluginId) {
      const plugin = find(this.plugins, { id: pluginId })
      plugin.show = true
      try {
        await this.$core.api.uninstallPlugin(pluginId)
        plugin.installed = false
        this.$bvToast.toast(this.$t('plugins.deleteSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('plugins.deleteError'), { noCloseButton: true, variant: 'danger' })
      }
      plugin.show = false
    }
  }
}
</script>

<style lang="scss" scoped>
.plugins__card {
  max-width: calc(50% - 2rem);
  min-width: calc(50% - 2rem);
  width: calc(25% - 2rem);
}
</style>
