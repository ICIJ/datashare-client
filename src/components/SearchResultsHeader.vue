<template>
  <div class="search-results-header" :class="{ 'search-results-header--bordered': bordered, [`search-results-header--${position}`]: true }">
    <div class="search-results-header__settings d-flex align-items-center">
      <b-btn-group class="flex-grow-1">
        <b-dropdown size="sm" variant="link" class="search-results-header__settings__sort" toggle-class="text-decoration-none py-1 px-2 border search-results-header__settings__sort__toggler" menu-class="search-results-header__settings__sort__dropdown">
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
        <b-dropdown v-if="!noProgress" size="sm" variant="link" class="search-results-header__settings__size mr-2" toggle-class="text-decoration-none py-1 px-2 border search-results-header__settings__size__toggler" menu-class="search-results-header__settings__size__dropdown">
          <template v-slot:button-content>
            <span class="search-results-header__settings__size__toggler__slot">
              {{ searchFrom + 1 }} – {{ lastDocument }}
            </span>
            <span class="search-results-header__settings__size__toggler__hits text-muted">
              {{ $t('search.results.on') }} {{ $tc('search.results.results', response.total, { total: $n(response.get('hits.total')) }) }}
            </span>
          </template>
          <b-dropdown-header>
            {{ $t('search.settings.resultsPerPage') }}
          </b-dropdown-header>
          <b-dropdown-item v-for="size in searchSizes" :key="size" :active="size === searchSize" @click="selectSearchSize(size)">
            <div class="d-flex align-items-center">
              <span>
                {{ size }} by page
              </span>
            </div>
          </b-dropdown-item>
        </b-dropdown>
      </b-btn-group>
      <pagination
        class="search-results-header__settings__pagination justify-content-end text-right mr-3"
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

/**
 * Search results header displaying sorting and page length options.
 */
export default {
  name: 'SearchResultsHeader',
  components: {
    Pagination,
    AppliedSearchFilters
  },
  props: {
    /**
     * Position of the header.
     * @values top, bottom
     */
    position: {
      type: String,
      default: 'top',
      validator: value => ['top', 'bottom'].indexOf(value) >= -1
    },
    /**
     * Use borders
     */
    bordered: {
      type: Boolean
    },
    /**
     * Display the search results page offset.
     */
    noProgress: {
      type: Boolean
    },
    /**
     * Hide the active search filters.
     */
    noFilters: {
      type: Boolean
    }
  },
  data () {
    return {
      searchSizes: [10, 25, 50, 100],
      searchSorts: [
        'relevance',
        'creationDateNewest',
        'creationDateOldest',
        'sizeLargest',
        'sizeSmallest',
        'path',
        'pathReverse',
        'dateNewest',
        'dateOldest'
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
      this.$router.push({ name, query }).catch(() => {})
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

    &__settings {
      font-size: 0.95em;
      color: $text-muted;
      display: inline-flex;
      width: 100%;

      &__size, &__sort {

        &__toggler {
          font-size: inherit;
          line-height: inherit;
        }
      }
    }

    .search-results-header__settings__size__dropdown,
    .search-results-header__settings__sort__dropdown {
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
