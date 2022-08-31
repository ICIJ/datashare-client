<template>
  <b-btn :disabled="!hasActiveFilter"
         class="text-muted "
         variant="link"
         @click="deleteFilters">
    <fa icon="filter-circle-xmark"/>
    {{ $t('batchSearch.clearFilters') }}
  </b-btn>
</template>

<script>

import utils from '@/mixins/utils'
const SEARCH_PARAMS_SERVER = Object.freeze({
  query: false,
  publishState: true,
  project: true,
  dateStart: false,
  dateEnd: false,
  state: false,
  order: false,
  sort: false
})

export default {
  name: 'BatchSearchClearFilters',
  mixins: [utils],
  methods: {
    deleteFilters () {
      return this.$router.push({ name: 'batch-search', query: {} })
    }
  },
  computed: {
    filters () {
      const keys = Object.keys(SEARCH_PARAMS_SERVER)
      return this.isServer
        ? keys
        : keys.filter(key =>
          SEARCH_PARAMS_SERVER[key]
        )
    },
    currentFilters () {
      return Object.keys(this.$route.query)
    },
    hasActiveFilter () {
      const isContained = this.currentFilters.filter(f => this.filters.includes(f)).length !== 0
      return this.currentFilters.length !== 0 && isContained
    }
  }
}
</script>
