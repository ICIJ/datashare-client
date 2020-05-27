<template>
  <div class="batch-search-results-filters">
    <div class="card batch-search-results-filters__queries overflow-hidden border-0">
      <h6 class="card-header d-flex">
        <span class="flex-grow-1 my-auto">
          {{ $t('batchSearchResultsFilters.queries.heading') }}
        </span>
        <span class="my-auto mr-2" v-if="hasMultipleQueries">
          {{ $t('search.results.sort.sort') }}
        </span>
        <b-dropdown
          class="batch-search-results-filters__queries__sort"
          toggle-class="p-0"
          right
          :text="$t(`search.results.sort.${sortField}`)"
          variant="link"
          v-if="hasMultipleQueries">
          <b-dropdown-item v-for="key in sortFields" :key="key" @click="sort(key)" :active="key === sortField">
            {{ $t(`search.results.sort.${key}`) }}
          </b-dropdown-item>
        </b-dropdown>
      </h6>
      <div class="small">
        <selectable-dropdown
          class="batch-search-results-filters__queries__dropdown border-0 m-0 p-0"
          deactivate-keys
          @input="onInput"
          :items="queries"
          :multiple="hasMultipleQueries"
          v-model="selectedQueries">
          <template #item-label="{ item }">
            <div class="d-flex batch-search-results-filters__queries__dropdown__item">
              <span class="flex-grow-1 text-truncate batch-search-results-filters__queries__dropdown__item__label">
                {{ item.label }}
              </span>
              <span class="batch-search-results-filters__queries__dropdown__item__count">
                <b-badge class="px-2" variant="tertiary" pill>
                  {{ $n(item.count) }}
                </b-badge>
              </span>
              <span
                class="batch-search-results-filters__queries__dropdown__item__search"
                @click.stop.prevent="executeSearch(item.label)">
                <fa icon="search" class="text-tertiary"></fa>
              </span>
            </div>
          </template>
        </selectable-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import castArray from 'lodash/castArray'
import compact from 'lodash/compact'
import concat from 'lodash/concat'
import filter from 'lodash/filter'
import find from 'lodash/find'
import get from 'lodash/get'
import indexOf from 'lodash/indexOf'
import isEqual from 'lodash/isEqual'
import map from 'lodash/map'
import omit from 'lodash/omit'
import orderBy from 'lodash/orderBy'

/**
 * Form to filter a bash search results by query
 */
export default {
  name: 'BatchSearchResultsFilters',
  props: {
    /**
     * The bath search uuid
     */
    uuid: {
      type: String
    },
    /**
     * The bath search index
     */
    index: {
      type: String
    }
  },
  data () {
    return {
      sortField: 'count',
      sortFields: ['default', 'count']
    }
  },
  computed: {
    meta () {
      if (this.$store.state.batchSearch) {
        return find(this.$store.state.batchSearch.batchSearches, { uuid: this.uuid }) || {}
      } else {
        return null
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
    hasMultipleQueries () {
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
  mounted () {
    this.readQueryFromRoute()
  },
  watch: {
    $route () {
      this.readQueryFromRoute()
    }
  },
  methods: {
    onInput (selectedQueries = this.selectedQueries) {
      const routeQuery = get(this, '$route.query', {})
      const order = routeQuery.order
      const page = routeQuery.page
      const queries = compact(map(selectedQueries, 'label'))
      const queriesSort = routeQuery.queries_sort
      const sort = routeQuery.sort
      const query = { order, page, queries, queries_sort: queriesSort, sort }
      const isEqualQuery = isEqual(omit(query, 'queries'), omit(routeQuery, 'queries')) && isEqual(castArray(query.queries), castArray(routeQuery.queries))
      if (!isEqualQuery) {
        this.$router.push({ name: 'batch-search.results', query }).catch(() => {})
      }
    },
    executeSearch (q) {
      this.$store.commit('search/reset')
      this.$router.push({ name: 'search', query: { q, index: this.index } }).catch(() => {})
    },
    sort (queriesSort) {
      const order = get(this, ['$route', 'query', 'order'], undefined)
      const page = get(this, ['$route', 'query', 'page'], undefined)
      const queries = get(this, ['$route', 'query', 'queries'], undefined)
      const sort = get(this, ['$route', 'query', 'sort'], undefined)
      this.$router.push({ name: 'batch-search.results', query: { order, page, queries, queries_sort: queriesSort, sort } }).catch(() => {})
    },
    readQueryFromRoute () {
      if (get(this, ['$route', 'query', 'queries_sort'], 'default') === 'default') {
        this.$set(this, 'sortField', 'default')
      } else {
        this.$set(this, 'sortField', 'count')
      }
      const queries = get(this, ['$route', 'query', 'queries'], [])
      this.$set(this, 'selectedQueries', filter(this.queries, ({ label }) => indexOf(queries, label) > -1))
    }
  }
}
</script>

<style lang="scss">
  .batch-search-results-filters {
    max-width: 90vw;
    width: 300px;

    &__queries {

      &__sort {
        z-index: 1001;

        .btn.dropdown-toggle {
          color: white;
        }
      }

      &__dropdown {
        max-height: 180px;
        overflow: auto;
        border-radius: 0;

        &__item {

          &__search:not([aria-describedby]) {
            display: none;
          }

          &:hover .batch-search-results-filters__queries__dropdown__item__search {
            color: inherit;
            cursor: pointer;
            display: block;
          }

          &:hover .batch-search-results-filters__queries__dropdown__item__count {
            display: none;
          }
        }
      }
    }
  }
</style>
