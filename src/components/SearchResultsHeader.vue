<template>
  <div class="search-results-header"
       :class="{ 'search-results-header--bordered': bordered, [`search-results-header--${position}`]: true }">
    <div class="search-results-header__settings d-flex align-items-center">
      <b-btn-group class="flex-grow-1">
        <b-dropdown class="search-results-header__settings__sort"
                    menu-class="search-results-header__settings__sort__dropdown"
                    toggle-class="text-decoration-none py-2 px-2 border search-results-header__settings__sort__toggler"
                    size="sm"
                    variant="link">
          <template v-slot:button-content>
            {{ $t('search.results.sort.sortLabel') }}
          </template>
          <b-dropdown-header>
            {{ $t('search.settings.sortBy') }}
          </b-dropdown-header>
          <b-dropdown-item :active="selectedSort === sort"
                           @click="selectSort(selectedSort)"
                           :key="selectedSort"
                           v-for="selectedSort in sorts">
            {{ $t('search.results.sort.' + selectedSort) }}
          </b-dropdown-item>
        </b-dropdown>
        <b-dropdown class="search-results-header__settings__size mr-2"
                    menu-class="search-results-header__settings__size__dropdown"
                    size="sm"
                    toggle-class="text-decoration-none py-1 px-2 border search-results-header__settings__size__toggler"
                    v-if="!noProgress"
                    variant="link">
          <template v-slot:button-content>
            <span class="search-results-header__settings__size__toggler__slot">
              {{ firstDocument }} – {{ lastDocument }}
            </span>
            <span class="search-results-header__settings__size__toggler__hits text-muted">
              {{ $t('search.results.on') }} {{ $tc('search.results.results', response.total, { total: $n(response.total) }) }}
            </span>
          </template>
          <b-dropdown-header>
            {{ $t('search.settings.resultsPerPage') }}
          </b-dropdown-header>
          <b-dropdown-item :active="selectedSize === size"
                           @click="selectSize(selectedSize)"
                           :key="selectedSize"
                           v-for="selectedSize in sizes">
            <div class="d-flex align-items-center">
              <span>
                {{ selectedSize }} {{ $t('search.results.perPage') }}
              </span>
            </div>
          </b-dropdown-item>
        </b-dropdown>
      </b-btn-group>
      <b-btn variant="link" v-if="response.total > 0 && hasFeature('BATCH_DOWNLOAD')" class="search-results-header__settings__btn-download text-nowrap ml-auto" @click="batchDownload">
        <fa icon="download"></fa>
        <span v-if="!noLabels" class="ml-2">
          {{ $t('search.results.batchDownload') }}
        </span>
      </b-btn>
      <pagination
        class="search-results-header__settings__pagination justify-content-end text-right mr-3"
        :get-to-template="getToTemplate"
        :is-displayed="isDisplayed"
        :no-last-page-link="searchWindowTooLarge"
        :position="position"
        :total="response.total"></pagination>
    </div>
    <div class="search-results-header__applied-search-filters" v-if="position === 'top' && !noFilters">
      <applied-search-filters></applied-search-filters>
    </div>
  </div>
</template>

<script>
import { cloneDeep, min } from 'lodash'
import { mapState } from 'vuex'

import AppliedSearchFilters from '@/components/AppliedSearchFilters'
import Pagination from '@/components/Pagination'
import features from '@/mixins/features'

/**
 * Search results header displaying sorting and page length options.
 */
export default {
  name: 'SearchResultsHeader',
  components: {
    AppliedSearchFilters,
    Pagination
  },
  mixins: [features],
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
    },
    /**
     * Hide labels when size is too narrow
     */
    noLabels: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      sizes: [10, 25, 50, 100],
      sorts: [
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
    ...mapState('search', ['from', 'response', 'size', 'sort']),
    firstDocument () {
      return this.lastDocument === 0 ? 0 : this.from + 1
    },
    lastDocument () {
      return min([this.response.total, this.from + this.size])
    },
    searchWindowTooLarge () {
      return (this.response.total + this.size) >= this.$config.get('search.maxWindowSize', 1e4)
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
      return this.response.total > this.size
    },
    selectSize (size) {
      // Store new search size into store
      this.$store.commit('search/size', size)
      // Change the route
      this.refreshRouteAndSearch()
    },
    selectSort (sort) {
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
    },
    batchDownload () {
      this.$store.dispatch('search/runBatchDownload')
      const to = { name: 'batch-download' }
      const variant = 'primary'
      const title = this.$t('batchDownload.created')
      this.$root.$bvToast.toast(this.$t('batchDownload.inProgress'), { to, variant, title })
    }
  }
}
</script>

<style lang="scss" scoped>
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
      color: $text-muted;
      display: inline-flex;
      font-size: 0.95em;
      width: 100%;

      &__size, &__sort {
        &__toggler {
          font-size: $font-size-sm;
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
        border-bottom: 1px solid $border-color;
        color: $body-color;
        font-weight: bold;
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
