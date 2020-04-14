<template>
  <div class="batch-search-results-filters">
    <div class="card m-3 batch-search-results-filters__queries overflow-hidden">
      <h6 class="card-header d-flex">
        <span class="flex-grow-1 my-auto">
          {{ $t('batchSearchResultsFilters.queries.heading') }}
        </span>
        <span class="my-auto mr-2" v-if="isMultipleQueries">
          {{ $t('search.results.sort.sort') }}
        </span>
        <b-dropdown
          class="batch-search-results-filters__queries__sort"
          right
          :text="$t(`search.results.sort.${sortField}`)"
          variant="primary"
          v-if="isMultipleQueries">
          <b-dropdown-item v-for="key in sortFields" :key="key" @click="sort(key)">
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
          multiple
          v-if="isMultipleQueries"
          v-model="selectedQueries">
          <template #item-label="{ item }">
            <div class="d-flex batch-search-results-filters__queries__dropdown__item" :id="item.label">
              <span class="flex-grow-1 text-truncate batch-search-results-filters__queries__dropdown__item__label">
                {{ item.label }}
              </span>
              <span class="batch-search-results-filters__queries__dropdown__item__count">
                <b-badge class="px-2" variant="tertiary" pill>
                {{ $n(item.count) }}
              </b-badge>
              </span>
              <span class="batch-search-results-filters__queries__dropdown__item__search" @click.stop.prevent="executeSearch(item.label)">
                <fa icon="search" class="text-tertiary" />
              </span>
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
  data () {
    return {
      selectedQueriesOnRouteEnter: [],
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
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$set(vm, 'selectedQueriesOnRouteEnter', castArray(get(to, ['query', 'queries'], [])))
    })
  },
  beforeRouteUpdate (to, from, next) {
    if (to.query.queries_sort === 'default') {
      this.$set(this, 'sortField', 'default')
    } else {
      this.$set(this, 'sortField', 'count')
    }
    this.$set(this, 'selectedQueries', filter(this.queries, query => indexOf(to.query.queries, query.label) > -1))
    next()
  },
  methods: {
    onInput (selectedQueries) {
      const order = get(this, ['$route', 'query', 'order'], undefined)
      const page = get(this, ['$route', 'query', 'page'], undefined)
      const selectedQueriesOnRouteEnter = get(this, 'selectedQueriesOnRouteEnter', [])
      const queries = compact(concat(selectedQueriesOnRouteEnter, map(selectedQueries, 'label')))
      const queriesSort = get(this, ['$route', 'query', 'queries_sort'], undefined)
      const sort = get(this, ['$route', 'query', 'sort'], undefined)
      this.$set(this, 'selectedQueriesOnRouteEnter', [])
      const query = { order, page, queries, queries_sort: queriesSort, sort }
      const isEqualQuery = isEqual(omit(query, 'queries'), omit(this.$route.query, 'queries')) && isEqual(castArray(query.queries), castArray(this.$route.query.queries))
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
            color: inherit;
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
