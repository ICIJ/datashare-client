<template>
  <div class="batch-search-results-filters">
    <div class="card m-3 batch-search-results-filters__queries overflow-hidden">
      <h6 class="card-header d-flex">
        <span class="flex-grow-1 my-auto">
          {{ $t('batchSearchResultsFilters.queries.heading') }}
        </span>
        <span class="my-auto mr-2">
          {{ $t('search.results.sort.sort') }}
        </span>
        <b-dropdown :text="sortField" class="batch-search-results-filters__queries__sort" variant="primary" right v-if="isMultipleQueries">
          <b-dropdown-item v-for="key in sortFields" :key="key" @click="sort(key)">
            {{ $t('search.results.sort.' + key) }}
          </b-dropdown-item>
        </b-dropdown>
      </h6>
      <div class="small">
        <selectable-dropdown
          class="batch-search-results-filters__queries__dropdown border-0 m-0 p-0"
          deactivate-keys
          :items="queries"
          multiple
          v-if="isMultipleQueries"
          v-model="selectedQueries"
          @input="onInput">
          <template #item-label="{ item }">
            <div class="d-flex batch-search-results-filters__queries__dropdown__item" :id="item.label">
              <span class="flex-grow-1 text-truncate">
                {{ item.label }}
              </span>
              <b-badge class="my-1 px-2 batch-search-results-filters__queries__dropdown__item__count" variant="tertiary" pill>
                {{ $n(item.count) }}
              </b-badge>
              <fa icon="search" class="text-tertiary batch-search-results-filters__queries__dropdown__item__search" @click.stop.prevent="executeSearch(item.label)" />
            </div>
            <b-tooltip placement="bottom" :target="item.label" :title="item.label" />
          </template>
        </selectable-dropdown>
        <div v-else v-for="query in queries" :key="query.label" class="flex-grow-1 batch-search-results-filters__queries__list px-3 py-1">
          <div class="d-flex" :id="query.label">
            <span class="flex-grow-1 text-truncate">
              {{ query.label }}
            </span>
            <b-badge class="my-1 px-2" variant="tertiary" pill>
              {{ $n(query.count) }}
            </b-badge>
          </div>
          <b-tooltip placement="bottom" :target="query.label" :title="query.label" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import find from 'lodash/find'
import map from 'lodash/map'
import orderBy from 'lodash/orderBy'

export default {
  name: 'BatchSearchResultsFilters',
  props: {
    uuid: String,
    index: String
  },
  data () {
    return {
      sortField: 'default',
      sortFields: ['default', 'count']
    }
  },
  computed: {
    meta () {
      if (this.$store.state.batchSearch) {
        return find(this.$store.state.batchSearch.batchSearches, { uuid: this.uuid }) || {}
      }
    },
    metaQueriesKeys () {
      return map(this.meta.queries, (a, b) => { return { label: b, count: a } })
    },
    queries () {
      if (this.sortField === 'count') {
        return orderBy(this.metaQueriesKeys, ['count'], ['desc'])
      } else {
        return this.metaQueriesKeys
      }
    },
    isMultipleQueries () {
      return this.queries && this.queries.length > 1
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
    },
    sort (sortField) {
      this.sortField = sortField
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

      &__sort {

        & .dropdown-menu {
          z-index: 1001;
        }
      }

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
