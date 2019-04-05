<template>
  <div class="search-results__header__applied-filters py-1" v-if="queryTerms.length">
    <search-results-applied-filter v-for="term in queryTerms" :key="term" :term="term" />
  </div>
</template>

<script>
import SearchResultsAppliedFilter from '@/components/SearchResultsAppliedFilter'
import filter from 'lodash/filter'
import split from 'lodash/split'
import uniq from 'lodash/uniq'

export default {
  name: 'SearchResultsAppliedFilters',
  components: {
    SearchResultsAppliedFilter
  },
  computed: {
    queryTerms () {
      return filter(uniq(split(this.$store.state.search.query, ' ')), i => i !== '*')
    }
  }
}
</script>

<style lang="scss">
  .search-results__header__applied-filters {
    border-bottom: 1px solid $gray-200;
  }
</style>
