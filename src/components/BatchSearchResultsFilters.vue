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
        <search-form-control
          :placeholder="$t('batchSearchResultsFilters.filterQueries')"
          v-model="queriesFilter"></search-form-control>
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
import { castArray, cloneDeep, compact, find, get, isEqual, map, orderBy } from 'lodash'
import Fuse from 'fuse.js'

import SearchFormControl from '@/components/SearchFormControl'

/**
 * Form to filter a batch search results by query
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
     * The batch search indices
     */
    indices: {
      type: [String, Array]
    }
  },
  components: {
    SearchFormControl
  },
  data () {
    return {
      queriesFilter: null,
      sortField: 'count',
      sortFields: ['default', 'count']
    }
  },
  computed: {
    fuse () {
      const keys = ['label']
      const options = { shouldSort: false, keys }
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
      this.$router.push({ name: 'search', query: { q, indices: this.indices.join(',') } }).catch(() => {})
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
      const queries = castArray(get(this, ['$route', 'query', 'queries'], []))
      this.selectedQueries = queries.map(label => find(this.queries, { label }))
    }
  }
}
</script>

<style lang="scss" scoped>
  .batch-search-results-filters {
    max-width: 90vw;
    width: 300px;

    &__queries {
      &__search {
        background-color: $card-cap-bg;
        padding: $card-spacer-y $card-spacer-x;
      }

      &__sort {
        z-index: 1001;

        /deep/ .btn.dropdown-toggle {
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
