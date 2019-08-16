<template>
  <component :is="component" class="search-results" :class="{ [`search-results--${layout}`]: true }" />
</template>

<script>
import { mapState } from 'vuex'
import SearchResultsGrid from '@/components/SearchResultsGrid'
import SearchResultsList from '@/components/SearchResultsList'

export default {
  name: 'SearchResults',
  components: {
    SearchResultsGrid,
    SearchResultsList
  },
  computed: {
    component () {
      switch (this.layout) {
        case 'grid': return SearchResultsGrid
        default: return SearchResultsList
      }
    },
    ...mapState('search', ['layout'])
  }
}
</script>
