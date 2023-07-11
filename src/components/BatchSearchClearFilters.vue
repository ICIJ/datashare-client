<template>
  <b-btn
    :disabled="!hasActiveFilter"
    class="batch-search-clear-filters text-muted"
    variant="link"
    @click="deleteFilters"
  >
    <fa icon="filter-circle-xmark" />
    {{ $t('batchSearch.clearFilters') }}
  </b-btn>
</template>

<script>
import utils from '@/mixins/utils'

export default {
  name: 'BatchSearchClearFilters',
  mixins: [utils],
  props: {
    routeName: {
      type: String,
      required: true
    },
    localSearchParams: {
      type: Object,
      required: true
    }
  },
  computed: {
    filters() {
      const keys = Object.keys(this.localSearchParams)
      return this.isServer ? keys : keys.filter((key) => this.localSearchParams[key])
    },
    currentFilters() {
      return Object.keys(this.$route?.query)
    },
    hasActiveFilter() {
      const isContained = this.currentFilters.filter((f) => this.filters.includes(f)).length !== 0
      return this.currentFilters.length !== 0 && isContained
    }
  },
  methods: {
    deleteFilters() {
      return this.$router.push({ name: this.routeName, query: {} })
    }
  }
}
</script>
