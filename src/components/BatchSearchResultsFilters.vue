<template>
  <div class="batch-search-results-filters">
    <div class="card batch-search-results-filters__queries overflow-hidden border-0">
      <h6 class="card-header d-flex align-items-center">
        <span class="flex-grow-1 my-auto">
          {{ $t('batchSearchResultsFilters.queries.heading') }}
        </span>
        <span class="mr-2" v-if="hasMultipleQueries">
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
      <div class="batch-search-results-filters__queries__search text-dark">
        <search-form-control :placeholder="$t('batchSearchResultsFilters.filterQueries')" v-model="queriesFilter"></search-form-control>
      </div>
      <div class="small">
        <selectable-dropdown
          class="batch-search-results-filters__queries__dropdown border-0 m-0 p-0"
          deactivate-keys
          multiple
          v-model="selectedQueries"
          :eq="(item, other) => item.label === other.label"
          :items="filteredQueries">
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
import cloneDeep from 'lodash/cloneDeep'
import compact from 'lodash/compact'
import find from 'lodash/find'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import map from 'lodash/map'
import orderBy from 'lodash/orderBy'
import Fuse from 'fuse.js'

import SearchFormControl from '@/components/SearchFormControl'

/**
 * Form to filter a bash search results by query
 */
export default {
  name: 'BatchSearchResultsFilters',
  props: {
    /**
     * The batch search uuid
     */
    uuid: {
      type: String
    },
    /**
     * The batch search index
     */
    index: {
      type: String
    }
  },
  components: {
    SearchFormControl
  },
  data () {
    return {
      sortField: 'count',
      sortFields: ['default', 'count'],
      queriesFilter: null
    }
  },
  computed: {
    fuse () {
      const keys = ['label']
      const options = { distance: 0, shouldSort: false, keys }
      return new Fuse(this.queries, options)
    },
    meta () {
      return get(this, '$store.state.batchSearch.batchSearch', null)
    },
    queriesKeys () {
      return map(this.meta.queries, (count, label) => ({ label, count }))
    },
    queries () {
      if (this.sortField === 'count') {
        return orderBy(this.queriesKeys, ['count'], ['desc'])
      } else {
        return this.queriesKeys
      }
    },
    filteredQueries () {
      return this.queriesFilter ? this.fuse.search(this.queriesFilter) : this.queries
    },
    hasMultipleQueries () {
      return this.queries && this.queries.length > 1
    },
    selectedQueries: {
      set (queries) {
        this.$store.commit('batchSearch/selectedQueries', cloneDeep(queries))
        this.updateRoute()
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
    updateRoute () {
      const routeQuery = get(this, '$route.query', {})
      const queries = compact(map(this.selectedQueries, 'label'))
      if (!isEqual(routeQuery.queries || [], queries)) {
        const query = { ...routeQuery, queries }
        this.$router.push({ name: 'batch-search.results', query }).catch(() => {})
      }
    },
    executeSearch (q) {
      this.$store.commit('search/reset')
      this.$router.push({ name: 'search', query: { q, index: this.index } }).catch(() => {})
    },
    sort (queriesSort) {
      const routeQuery = get(this, '$route.query', {})
      const query = { ...routeQuery, queries_sort: queriesSort }
      this.$router.push({ name: 'batch-search.results', query }).catch(() => {})
    },
    readQueryFromRoute () {
      if (get(this, ['$route', 'query', 'queries_sort'], null) === 'default') {
        this.$set(this, 'sortField', 'default')
      } else {
        this.$set(this, 'sortField', 'count')
      }
      const queries = get(this, ['$route', 'query', 'queries'], [])
      this.selectedQueries = queries.map(label => find(this.queries, { label }))
    }
  }
}
</script>

<style lang="scss">
  .batch-search-results-filters {
    max-width: 90vw;
    width: 300px;

    &__queries {

      &__search {
        padding: $card-spacer-y $card-spacer-x;
        background-color: $card-cap-bg;
      }

      &__sort {
        z-index: 1001;

        .btn.dropdown-toggle {
          color: white;
          text-decoration: none;
        }
      }

      &__dropdown {
        border-radius: 0;
        max-height: 280px;
        overflow: auto;

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
