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
            <div class="d-flex batch-search-results-filters__queries__dropdown__item" :id="item">
              <span class="flex-grow-1 text-truncate">
                {{ item }}
              </span>
              <b-badge class="my-1 px-2 batch-search-results-filters__queries__dropdown__item__count" variant="tertiary" pill>
                {{ meta.queries[item] }}
              </b-badge>
              <fa icon="search" class="text-tertiary batch-search-results-filters__queries__dropdown__item__search" @click.stop.prevent="executeSearch(item)" />
            </div>
            <b-tooltip placement="bottom" :target="item" :title="item" />
          </template>
        </selectable-dropdown>
        <div v-else v-for="(count, query) in meta.queries" :key="query" class="flex-grow-1 batch-search-results-filters__queries__list px-3 py-1">
          <div class="d-flex" :id="query">
            <span class="flex-grow-1 text-truncate">
              {{ query }}
            </span>
            <b-badge class="my-1 px-2" variant="tertiary" pill>
              {{ $n(count) }}
            </b-badge>
          </div>
          <b-tooltip placement="bottom" :target="query" :title="query" />
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
    uuid: String,
    index: String
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
    },
    executeSearch (query) {
      this.$store.commit('search/reset')
      this.$router.push({ name: 'search', query: { q: query } })
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

        &__item {

          &__search:not([aria-describedby]) {
            display: none;
          }

          &:hover .batch-search-results-filters__queries__dropdown__item__search {
            display: block;
            color: inherit;
          }

          &:hover .batch-search-results-filters__queries__dropdown__item__count {
            display: none;
          }
        }
      }
    }
  }
</style>
