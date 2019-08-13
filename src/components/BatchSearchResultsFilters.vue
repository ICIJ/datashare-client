<template>
  <div class="batch-search-results-filters">
    <div class="card m-3 batch-search-results-filters__queries overflow-hidden">
      <h6 class="card-header">
        {{ $t('batchSearchResultsFilters.queries.heading') }}
      </h6>
      <div class="small">
        <selectable-dropdown
          class="batch-search-results-filters__queries__dropdown border-0 m-0 p-0"
          deactivate-keys
          :items="meta.queries"
          multiple
          v-if="meta.queries && meta.queries.length > 1"
          v-model="selectedQueries"></selectable-dropdown>
        <div v-else v-for="query in meta.queries" :key="query" class="batch-search-results-filters__queries__list">
          {{ query }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import find from 'lodash/find'

export default {
  name: 'BatchSearchResultsFilters',
  props: {
    uuid: {
      type: String
    },
    index: {
      type: String
    }
  },
  computed: {
    meta () {
      if (this.$store.state.batchSearch) {
        return find(this.$store.state.batchSearch.batchSearches, { uuid: this.uuid }) || { }
      }
    },
    selectedQueries: {
      set (queries) {
        this.$store.commit('batchSearch/selectedQueries', queries)
      },
      get () {
        return this.$store.state.batchSearch.selectedQueries
      }
    }
  }
}
</script>

<style lang="scss">
  .batch-search-results-filters {
    width: $app-context-sidebar-width;

    &__queries {

      &__dropdown {
        max-height: calc(40vh + 100px);
        overflow: auto;
      }
    }
  }
</style>
