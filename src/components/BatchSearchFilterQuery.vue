<template>
  <form class="batch-search-filter-query col-md-6 px-0" @submit.prevent="filterByQuery">
    <search-bar-input v-model="search"
                      :placeholder="$t('batchSearch.placeholder')"
                      class="batch-search-filter-query__input"
                      hide-tips
    >
      <template #fields>
        <search-bar-input-dropdown
          v-model="field"
          :fieldOptions="fieldOptions"
          :fieldOptionsPath="fieldOptionsPath"
          class="batch-search-filter-query__field"
        />
      </template>
    </search-bar-input>
  </form>
</template>

<script>
import SearchBarInput from '@/components/SearchBarInput'
import SearchBarInputDropdown from '@/components/SearchBarInputDropdown'

export default {
  name: 'BatchSearchFilterQuery',
  components: { SearchBarInputDropdown, SearchBarInput },
  data () {
    return {
      field: 'all',
      search: this.$route?.query?.query ?? ''
    }
  },
  watch: {
    $route (value) {
      this.search = value?.query?.query
    }
  },
  methods: {
    filterByQuery () {
      const params = this.$route?.query
      return this.$router.push({
        name: 'batch-search',
        query: { ...params, page: 1, query: this.search }
      })
    }
  },
  computed: {
    fieldOptions () {
      const options = ['all', 'name', 'description']
      if (this.isServer) {
        options.push('user_id')
      }
      return options
    },
    fieldOptionsPath () {
      return ['batchSearch', 'field']
    }
  }
}
</script>
