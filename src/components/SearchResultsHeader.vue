<template>
  <div class="search-results-header" :class="{ 'search-results-header--bordered': bordered, [`search-results-header--${position}`]: true }">
    <div class="search-results-header__paging">
      <div class="search-results-header__paging__progress mr-2 flex-grow-1" v-if="!noProgress">
        <span class="search-results-header__paging__progress__pagination mr-2">
          <b-dropdown size="sm"  variant="link" toggle-class="text-decoration-none py-1 border search-results-header__paging__progress__pagination__toggler" menu-class="search-results-header__paging__progress__pagination__dropdown">
            <template v-slot:button-content>
              {{ searchFrom + 1 }} – {{ lastDocument }}
            </template>
            <b-dropdown-header>
              {{ $t('search.settings.resultsPerPage') }}
            </b-dropdown-header>
            <b-dropdown-item v-for="size in searchSizes" :key="size" :active="size === searchSize" @click="selectSearchSize(size)">
              <div class="d-flex align-items-center">
                <span>
                  {{ searchFrom + 1 }} – <span class="font-weight-bold">{{ Math.min(searchFrom + size, response.total) }}</span>
                </span>
                <span class="text-muted ml-auto pl-4" v-if="searchFrom > 0">
                  {{ size }}/page
                </span>
              </div>
            </b-dropdown-item>
          </b-dropdown>
        </span>
        <span class="search-results-header__paging__progress_number-of-results">
          {{ $t('search.results.on') }} {{ $tc('search.results.results', response.total, { total: $n(response.get('hits.total')) }) }}
        </span>
      </div>
      <div class="search-results-header__sort mr-auto">
        <b-dropdown size="sm" right variant="link" toggle-class="text-decoration-none py-1 border search-results-header__sort__toggler" menu-class="search-results-header__sort__dropdown">
          <template v-slot:button-content>
            Sort
          </template>
          <b-dropdown-header>
            {{ $t('search.settings.sortBy') }}
          </b-dropdown-header>
          <b-dropdown-item v-for="sort in searchSorts" :key="sort" :active="sort === searchSort" @click="selectSearchSort(sort)">
            {{ $t('search.results.sort.' + sort) }}
          </b-dropdown-item>
        </b-dropdown>
      </div>
      <pagination
        class="justify-content-end text-right mr-3"
        :get-to-template="getToTemplate"
        :is-displayed="isDisplayed"
        :no-last-page-link="searchWindowTooLarge"
        :position="position"
        :total="response.total"></pagination>
    </div>
    <div class="search-results-header__applied-search-filters" v-if="position === 'top' && !noFilters">
      <applied-search-filters />
    </div>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
import min from 'lodash/min'
import { mapState } from 'vuex'

import Pagination from '@/components/Pagination'
import AppliedSearchFilters from '@/components/AppliedSearchFilters'

export default {
  name: 'SearchResultsHeader',
  components: {
    Pagination,
    AppliedSearchFilters
  },
  props: {
    position: {
      type: String,
      default: 'top',
      validator: value => ['top', 'bottom'].indexOf(value) >= -1
    },
    bordered: {
      type: Boolean
    },
    noProgress: {
      type: Boolean
    },
    noFilters: {
      type: Boolean
    }
  },
  data () {
    return {
      searchSizes: [10, 25, 50, 100],
      searchSorts: [
        'relevance',
        'dateNewest',
        'dateOldest',
        'creationDateNewest',
        'creationDateOldest',
        'sizeLargest',
        'sizeSmallest',
        'path',
        'pathReverse'
      ]
    }
  },
  computed: {
    ...mapState('search', {
      response: 'response',
      searchSize: 'size',
      searchSort: 'sort',
      searchFrom: 'from'
    }),
    lastDocument () {
      return min([this.response.total, this.$store.state.search.from + this.$store.state.search.size])
    },
    searchWindowTooLarge () {
      return (this.response.total + this.$store.state.search.size) >= this.$config.get('search.maxWindowSize', 1e4)
    }
  },
  mounted () {
    // Force page to scroll top at each load
    // Specially for pagination
    document.body.scrollTop = document.documentElement.scrollTop = 0
  },
  methods: {
    getToTemplate () {
      return { name: 'search', query: cloneDeep(this.$store.getters['search/toRouteQuery']()) }
    },
    isDisplayed () {
      return this.response.total > this.$store.state.search.size
    },
    selectSearchSize (size) {
      // Store new search size into store
      this.$store.commit('search/size', size)
      // Change the route
      this.refreshRouteAndSearch()
    },
    selectSearchSort (sort) {
      // Store new search sort into store
      this.$store.commit('search/sort', sort)
      // Change the route
      this.refreshRouteAndSearch()
    },
    refreshRouteAndSearch () {
      this.refreshRoute()
      this.refreshSearch()
    },
    refreshRoute () {
      const name = 'search'
      const query = this.$store.getters['search/toRouteQuery']()
      this.$router.push({ name, query })
    },
    refreshSearch () {
      this.$store.dispatch('search/query')
    }
  }
}
</script>

<style lang="scss">
  .search-results-header {
    padding: 0.5 * $spacer 0;

    &--bordered {
      &.search-results-header--top {
        border-bottom: 1px solid $gray-200;
      }
      &.search-results-header--bottom {
        border-top: 1px solid $gray-200;
      }
    }

    &__paging {
      font-size: 0.95em;
      color: $text-muted;
      display: inline-flex;
      width: 100%;

      &, &__progress, &__progress__pagination {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      &__progress {

        &__pagination {

          &__toggler {
            font-size: inherit;
            line-height: inherit;
          }
        }
      }
    }

    .search-results-header__paging__progress__pagination__dropdown,
    .search-results-header__sort__dropdown {
      min-width: 100%;
      padding-top: 0;

      .dropdown-header {
        background: $gray-100;
        font-weight: bold;
        color: $body-color;
        border-bottom: 1px solid $border-color;
      }

      .dropdown-item, .dropdown-header {
        font-size: inherit;
        line-height: inherit;
        padding: 0.25rem 0.75rem;

        &.active .text-muted,
        &:focus .text-muted {
          color: white !important;
          opacity: 0.6;
        }
      }
    }
  }
</style>
