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
      <div v-for="plugin in plugins" :key="plugin.id" class="plugins__plugin mb-3">
        <div>
          <span class="plugins__plugin__name font-weight-bold">
            <a :href="plugin.url" target="_blank" class="text-dark">
              {{ plugin.name }}
            </a>
          </span>
          <span class="plugins__plugin__version">
            {{ plugin.version }}
          </span>
        </div>
        <div class="plugins__plugin__description">
          {{ plugin.description }}
        </div>
      </div>
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
    }
  }
}
</script>
