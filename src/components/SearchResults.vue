<template>
  <component :is="component" class="search-results" :class="{ [`search-results--${layout}`]: true }" />
</template>

<script>
import { mapState } from 'vuex'
import {defineAsyncComponent} from 'vue'
/**
 * Display the search results (from the store) in the selected layout.
 */
export default {
  name: 'SearchResults',
  computed: {
    component() {
      switch (this.layout) {
        case 'grid':
          return defineAsyncComponent(() => import('@/components/SearchResultsGrid'))
        case 'table':
          return defineAsyncComponent(() => import('@/components/SearchResultsTable'))
        default:
          return defineAsyncComponent(() => import('@/components/SearchResultsList'))
      }
    },
    ...mapState('search', ['layout'])
  }
}
</script>
