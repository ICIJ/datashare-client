<template>
  <component :is="component" class="search-results" :class="{ [`search-results--${layout}`]: true }" />
</template>

<script>
import { mapState } from 'vuex'

/**
 * Display the search results (from the store) in the selected layout.
 */
export default {
  name: 'SearchResults',
  computed: {
    component() {
      switch (this.layout) {
        case 'grid':
          return () => import('@/components/SearchResultsGrid')
        case 'table':
          return () => import('@/components/SearchResultsTable')
        default:
          return () => import('@/components/SearchResultsList')
      }
    },
    ...mapState('search', ['layout'])
  }
}
</script>
