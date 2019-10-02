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
          :items="metaQueriesKeys"
          multiple
          v-if="meta.queries && metaQueriesKeys.length > 1"
          v-model="selectedQueries"
          @input="onInput">
          <template #item-label="{ item }">
            {{ item }}
            <b-badge class="float-right my-1 px-2" variant="tertiary" pill>{{ meta.queries[item] }}</b-badge>
          </template>
        </selectable-dropdown>
        <div v-else v-for="(count, query) in meta.queries" :key="query" class="batch-search-results-filters__queries__list px-3 py-1">
          {{ query }}
          <b-badge class="float-right my-1 px-2" variant="tertiary" pill>{{ $n(count) }}</b-badge>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import find from 'lodash/find'
import keys from 'lodash/keys'

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
    metaQueriesKeys () {
      return keys(this.meta.queries)
    },
    selectedQueries: {
      set (queries) {
        this.$store.commit('batchSearch/selectedQueries', queries)
      },
      get () {
        return this.$store.state.batchSearch.selectedQueries
      }
    }
  },
  methods: {
    onInput () {
      this.$root.$emit('batch-search-results::filter')
    }
  }
}
</script>

<style lang="scss">
  .batch-search-results-filters {
    max-width: $app-context-sidebar-width;
    min-width: $app-context-sidebar-width;
    width: 100%;

    &__queries {

      &__dropdown {
        max-height: calc(40vh + 100px);
        overflow: auto;
      }
    }
  }
</style>
