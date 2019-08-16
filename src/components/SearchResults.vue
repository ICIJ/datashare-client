<template>
  <component :is="component" class="search-results" :class="{ [`search-results--${layout}`]: true }" />
</template>

<script>
import { mapState } from 'vuex'
import SearchResultsGrid from '@/components/SearchResultsGrid'
import SearchResultsList from '@/components/SearchResultsList'
import SearchResultsTable from '@/components/SearchResultsTable'

export default {
  name: 'SearchResults',
  components: {
    SearchResultsGrid,
    SearchResultsList,
    SearchResultsTable
  },
  computed: {
    component () {
      switch (this.layout) {
        case 'grid': return SearchResultsGrid
        case 'table': return SearchResultsTable
        default: return SearchResultsList
      }
    },
    ...mapState('search', ['layout'])
  }
}
</script>
