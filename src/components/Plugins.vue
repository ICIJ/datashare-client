<template>
  <div class="plugins h-100">
    <div class="container pt-4">
      <div class="d-flex mb-2">
        <div class="plugins__search flex-grow-1">
          <search-form-control :placeholder="$t('plugins.search')" v-model="searchTerm" @input="search"></search-form-control>
        </div>
        <div class="plugins__add ml-2">
          <b-btn variant="primary" @click="$refs.installPluginFromUrl.show()">
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
              <b-form-input type="url" class="b-form-control border-0" required placeholder="URL" v-model="url" :state="isUrl"></b-form-input>
              <b-form-invalid-feedback class="text-secondary mt-2">
                {{ $t('plugins.enterCorrectUrl') }}
              </b-form-invalid-feedback>
            </div>
            <b-btn variant="primary" class="float-right" @click="installFromUrl">
              {{ $t('plugins.install') }}
            </b-btn>
          </b-modal>
        </div>
      </div>
      <b-card-group deck>
        <b-card :header="plugin.name" v-for="plugin in plugins" :key="plugin.id" class="plugins__card mb-3" footer-bg-variant="white" footer-border-variant="white">
          <b-card-text>
            <div>
              {{ plugin.description }}
            </div>
            <div v-if="plugin.version" class="font-italic mt-2">
              {{ $t('plugins.version') }}: {{ plugin.version }}
            </div>
          </b-card-text>
          <template v-slot:footer>
            <div class="text-center">
              <b-btn :href="plugin.url" target="_blank" :title="$t('plugins.homePage')" v-if="plugin.url">
                <fa icon="home"></fa>
              </b-btn>
              <b-btn class="ml-2" @click="installPluginFromId(plugin.id)" :title="$t('plugins.install')">
                <fa icon="cloud-upload-alt"></fa>
              </b-btn>
              <b-btn class="ml-2" @click="uninstall(plugin.id)" :title="$t('plugins.uninstall')">
                <fa icon="trash-alt"></fa>
              </b-btn>
            </div>
          </template>
        </b-card>
      </b-card-group>
    </div>
  </div>
</template>

<script>
import Api from '@/api'
import SearchFormControl from '@/components/SearchFormControl'

const api = new Api()

export default {
  name: 'Plugins',
  components: {
    SearchFormControl
  },
  data () {
    return {
      plugins: [],
      searchTerm: '',
      url: ''
    }
  },
  async mounted () {
    const plugins = await api.getPlugins()
    this.$set(this, 'plugins', plugins)
  },
  computed: {
    isUrl () {
      const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
      return !!pattern.test(this.url)
    }
  },
  methods: {
    async search () {
      const plugins = await api.getPlugins(this.searchTerm)
      this.$set(this, 'plugins', plugins)
    },
    async installPluginFromId (pluginId) {
      try {
        await api.installPluginFromId(pluginId)
        this.$bvToast.toast(this.$t('plugins.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('plugins.submitError'), { noCloseButton: true, variant: 'danger' })
      }
    },
    async installFromUrl () {
      try {
        await api.installPluginFromUrl(this.url)
        this.$bvToast.toast(this.$t('plugins.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('plugins.submitError'), { noCloseButton: true, variant: 'danger' })
      }
      this.$refs.installPluginFromUrl.hide()
      this.$set(this, 'url', '')
    },
    async uninstall (pluginId) {
      try {
        await api.uninstallPlugin(pluginId)
        this.$bvToast.toast(this.$t('plugins.deleteSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('plugins.deleteError'), { noCloseButton: true, variant: 'danger' })
      }
    }
  }
}
</script>
<style lang="scss">
.plugins__card {
  max-width: calc(25% - 30px);
  min-width: calc(25% - 30px);
  width: calc(25% - 30px);

  .card-header {
    font-weight: bold;
  }
}

#plugins__add__modal {
  .modal-body {
    background: darken($primary, 20);
    color: white;
  }
}
</style>
