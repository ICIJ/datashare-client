<template>
  <div class="plugins h-100">
    <div class="container pt-4">
      <div class="d-flex mb-2">
        <div class="plugins__add ml-2">
          <b-btn variant="outline-primary" @click="$refs.installPluginFromUrl.show()">
            <fa icon="link" class="mr-1"></fa>
            {{ $t('plugins.installFromUrl') }}
          </b-btn>
          <b-modal ref="installPluginFromUrl" hide-footer id="plugins__add__modal">
            <template #modal-title>
              <fa icon="link" class="mr-1"></fa>
              {{ $t('plugins.installFromUrl') }}
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
            <b-btn variant="primary" class="float-right" @click="installPluginFromUrl">
              {{ $t('plugins.install') }}
            </b-btn>
            <b-overlay :show="show" no-wrap></b-overlay>
          </b-modal>
        </div>
        <div class="plugins__search ml-auto">
          <search-form-control :placeholder="$t('plugins.search')" v-model="searchTerm" @input="search" />
        </div>
      </div>
      <b-card-group deck>
        <b-overlay :show="plugin.show" v-for="plugin in plugins" :key="plugin.id" class="plugins__card m-3 d-flex">
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
                  <b-btn class="plugins__card__uninstall-button mb-2" @click="uninstallPlugin(plugin.id)" v-if="plugin.installed" variant="danger">
                    <fa icon="trash-alt"></fa>
                    {{ $t('plugins.uninstall') }}
                  </b-btn>
                  <b-btn class="plugins__card__download-button mb-2" @click="installPluginFromId(plugin.id)" variant="primary" v-if="!plugin.installed">
                    <fa icon="cloud-download-alt"></fa>
                    {{ $t('plugins.install') }}
                  </b-btn>
                  <b-btn class="plugins__card__update-button mb-2" @click="installPluginFromId(plugin.id)" variant="primary" v-if="plugin.installed && isPluginFromRegistry(plugin) && plugin.version !== plugin.deliverableFromRegistry.version" size="sm">
                    <fa icon="sync"></fa>
                    {{ $t('plugins.update') }}
                  </b-btn>
                  <div v-if="plugin.version && plugin.installed" class="plugins__card__version text-muted text-center">
                    {{ $t('plugins.version', { version: plugin.version  }) }}
                  </div>
                </div>
              </div>
            </b-card-text>
            <template v-slot:footer v-if="isPluginFromRegistry(plugin)" >
              <div class="plugins__card__official-version text-truncate w-100">
                <span class="font-weight-bold">
                  {{ $t('plugins.officialVersion') }}:
                </span>
                {{ plugin.deliverableFromRegistry.version }}
              </div>
              <div class="text-truncate w-100">
                <span class="font-weight-bold">
                  {{ $t('plugins.homePage') }}:
                </span>
                <a class="plugins__card__homepage" :href="plugin.deliverableFromRegistry.homepage" target="_blank" v-if="plugin.deliverableFromRegistry.homepage">
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

import Api from '@/api'
import SearchFormControl from '@/components/SearchFormControl'
import { isUrl } from '@/utils/strings'

const api = new Api()

/**
 * A list of available plugins.
 */
export default {
  name: 'Plugins',
  components: {
    SearchFormControl
  },
  data () {
    return {
      plugins: [],
      searchTerm: '',
      show: false,
      url: ''
    }
  },
  mounted () {
    this.search()
  },
  filters: {
    camelCase,
    startCase
  },
  methods: {
    isPluginFromRegistry (plugin) {
      return get(plugin, 'deliverableFromRegistry', false)
    },
    getPluginName (plugin) {
      return this.isPluginFromRegistry(plugin) ? plugin.deliverableFromRegistry.name : plugin.name
    },
    getPluginDescription (plugin) {
      return this.isPluginFromRegistry(plugin) ? plugin.deliverableFromRegistry.description : plugin.description
    },
    async search () {
      const plugins = await api.getPlugins(this.searchTerm)
      map(plugins, plugin => { plugin.show = false })
      this.$set(this, 'plugins', plugins)
    },
    async installPluginFromId (pluginId) {
      const plugin = find(this.plugins, { id: pluginId })
      plugin.show = true
      try {
        await api.installPluginFromId(pluginId)
        plugin.installed = true
        this.$bvToast.toast(this.$t('plugins.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('plugins.submitError'), { noCloseButton: true, variant: 'danger' })
      }
      plugin.show = false
    },
    async installPluginFromUrl () {
      this.$set(this, 'show', true)
      try {
        await api.installPluginFromUrl(this.url)
        await this.search()
        this.$bvToast.toast(this.$t('plugins.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('plugins.submitError'), { noCloseButton: true, variant: 'danger' })
      }
      this.$refs.installPluginFromUrl.hide()
      this.$set(this, 'show', false)
      this.$set(this, 'url', '')
    },
    async uninstallPlugin (pluginId) {
      const plugin = find(this.plugins, { id: pluginId })
      plugin.show = true
      try {
        await api.uninstallPlugin(pluginId)
        plugin.installed = false
        this.$bvToast.toast(this.$t('plugins.deleteSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('plugins.deleteError'), { noCloseButton: true, variant: 'danger' })
      }
      plugin.show = false
    },
    isUrl
  }
}
</script>

<style lang="scss" scoped>
.plugins__card {
  max-width: calc(50% - 2rem);
  min-width: calc(50% - 2rem);
  width: calc(25% - 2rem);
}

#plugins__add__modal {
  .modal-body {
    background: darken($primary, 20);
    color: white;
  }
}
</style>
