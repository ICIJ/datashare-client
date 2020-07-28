<template>
  <div class="plugins h-100">
    <div class="plugins__explanation bg-white py-5">
      <div class="container">
        <h3>
          <page-icon icon="plug"></page-icon>
          {{ $t('plugins.title') }}
        </h3>
        <p class="m-0">
          {{ $t('plugins.subtitle') }}
        </p>
      </div>
    </div>
    <div class="container pt-4">
      <div class="plugins__search input-group mb-3">
        <div class="input-group-prepend">
          <span class="input-group-text rounded-0 border-0 bg-white">
            <fa icon="search"></fa>
          </span>
        </div>
        <b-form-input type="text" class="form-control border-0" required :placeholder="$t('plugins.search')" @input="search" v-model="searchTerm"></b-form-input>
        <div class="invalid-feedback">
          {{ $t('plugins.search') }}
        </div>
      </div>
      <b-card-group deck>
        <b-card :header="plugin.name" v-for="plugin in plugins" :key="plugin.id" class="plugins__card mb-3" footer-bg-variant="white" footer-border-variant="white">
          <b-card-text>
            <div>
              {{ plugin.description }}
            </div>
            <div v-if="plugin.version" class="font-italic mt-2">
              Version: {{ plugin.version }}
            </div>
          </b-card-text>
          <template v-slot:footer>
            <div class="text-center">
              <b-btn :href="plugin.url" target="_blank">
                <fa icon="home"></fa>
              </b-btn>
              <b-btn class="ml-2" @click="install(plugin.id)">
                <fa icon="cloud-upload-alt"></fa>
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
import PageIcon from '@/components/PageIcon'

const api = new Api()

export default {
  name: 'Plugins',
  components: {
    PageIcon
  },
  data () {
    return {
      plugins: [],
      searchTerm: ''
    }
  },
  async mounted () {
    const plugins = await api.getPlugins()
    this.$set(this, 'plugins', plugins)
  },
  methods: {
    async search () {
      const plugins = await api.getPlugins(this.searchTerm)
      this.$set(this, 'plugins', plugins)
    },
    async install (pluginId) {
      try {
        await api.installPlugin(pluginId)
        this.$bvToast.toast(this.$t('plugins.submitSuccess'), { noCloseButton: true, variant: 'success' })
      } catch (_) {
        this.$bvToast.toast(this.$t('plugins.submitError'), { noCloseButton: true, variant: 'danger' })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.plugins__card {
  max-width: calc(25% - 30px);
  min-width: calc(25% - 30px);
  width: calc(25% - 30px);

  .card-header {
    font-weight: bold;
  }
}
</style>
