<template>
  <form class="batch-search-filter-query col-md-6 px-0" @submit.prevent="filterByQuery">
    <search-bar-input v-model="search"
                      :placeholder="$t('batchSearch.placeholder')"
                      class="batch-search-filter-query__input"
                      hide-tips
                      :disableSubmit="emptySearch"
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
import utils from '@/mixins/utils'

export default {
  name: 'BatchSearchFilterQuery',
  mixins: [utils],
  components: { SearchBarInputDropdown, SearchBarInput },
  data () {
    return {
      field: this.getField(this.$route?.query?.field),
      search: this.$route?.query?.query ?? ''
    }
  },
  watch: {
    $route (value) {
      this.search = value?.query?.query
      this.field = this.getField(value?.query?.field)
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
    },
    unchangedParams () {
      return this.search === this.$route?.query?.query && this.field === this.$route?.query?.field
    },
    emptySearch () {
      const urlQ = this.$route?.query?.query ?? ''
      return this.search?.length === 0 && urlQ === this.search
    }
  },
  methods: {
    filterByQuery () {
      const params = this.$route?.query ?? {}
      return this.$router.push({
        name: 'batch-search',
        query: { ...params, page: 1, query: this.search, field: this.field }
      }).catch((_) => {
        if (!this.unchangedParams) {
          return Promise.reject(_)
        }
      })
    },
    getField (value) {
      return this.fieldOptions?.includes(value) ? value : 'all'
    }
  }
}
</script>
