<template>
  <div>
    <div class="search-results-header" :class="{ 'search-results-header--bordered': bordered, [`search-results-header--${position}`]: true }">
      <div class="search-results-header__paging">
        <div class="search-results-header__paging__progress text-truncate">
          <span class="search-results-header__paging__progress__pagination">
            {{ $store.state.search.from + 1 }} – {{ lastDocument }}
          </span>
          <span class="search-results-header__paging__progress_number-of-results">
            {{ $t('search.results.on') }} {{ $tc('search.results.results', response.total, { total: $n(response.get('hits.total')) }) }}
          </span>
        </div>
        <router-link
             :to="firstPageLinkParameters()"
             :class="[isFirstOrPreviousPageAvailable() ? '' : 'disabled']"
             class="search-results-header__paging__first-page search-results-header__paging__angle px-2"
             v-b-tooltip.hover
             :title="$t('search.results.firstPage')"
             v-if="response.total > $store.state.search.size">
          <fa icon="angle-double-left" />
        </router-link>
        <router-link
             :to="previousPageLinkParameters()"
             :class="[isFirstOrPreviousPageAvailable() ? '' : 'disabled']"
             class="search-results-header__paging__previous-page search-results-header__paging__angle px-2 mr-2"
             v-b-tooltip.hover
             :title="$t('search.results.previousPage')"
             v-if="response.total > $store.state.search.size">
          <fa icon="angle-left" />
        </router-link>
        <router-link
             :to="nextPageLinkParameters()"
             :class="[isNextOrLastPageAvailable() ? '' : 'disabled']"
             class="search-results-header__paging__next-page search-results-header__paging__angle px-2"
             v-b-tooltip.hover
             :title="$t('search.results.nextPage')"
             v-if="response.total > $store.state.search.size">
          <fa icon="angle-right" />
        </router-link>
        <router-link
             :to="lastPageLinkParameters()"
             :class="[isNextOrLastPageAvailable() ? '' : 'disabled']"
             class="search-results-header__paging__last-page search-results-header__paging__angle px-2"
             v-b-tooltip.hover
             :title="$t('search.results.lastPage')"
             v-if="response.total > $store.state.search.size && !searchWindowTooLarge">
          <fa icon="angle-double-right" />
        </router-link>
      </div>
      <search-results-applied-filters v-if="position === 'top'" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import floor from 'lodash/floor'
import max from 'lodash/max'
import min from 'lodash/min'

import SearchResultsAppliedFilters from '@/components/SearchResultsAppliedFilters'

export default {
  name: 'SearchResultsHeader',
  components: {
    SearchResultsAppliedFilters
  },
  props: {
    position: {
      type: String,
      default: 'top',
      validator: value => ['top', 'bottom'].indexOf(value) >= -1
    },
    bordered: {
      type: Boolean
    }
  },
  computed: {
    lastDocument () {
      return min([this.response.total, this.$store.state.search.from + this.$store.state.search.size])
    },
    searchWindowTooLarge () {
      return (this.response.total + this.$store.state.search.size) >= this.$config.get('search.maxWindowSize', 1e4)
    },
    ...mapState('search', ['response'])
  },
  mounted () {
    // Force page to scroll top at each load
    // Specially for pagination
    document.body.scrollTop = document.documentElement.scrollTop = 0
  },
  methods: {
    firstPageLinkParameters () {
      let query = cloneDeep(this.$store.getters['search/toRouteQuery'])
      query.from = 0
      return { name: 'search', query }
    },
    previousPageLinkParameters () {
      let query = cloneDeep(this.$store.getters['search/toRouteQuery'])
      query.from = max([0, query.from - query.size])
      return { name: 'search', query }
    },
    nextPageLinkParameters () {
      let query = cloneDeep(this.$store.getters['search/toRouteQuery'])
      const nextFrom = query.from + query.size
      query.from = nextFrom < this.response.total ? nextFrom : query.from
      return { name: 'search', query }
    },
    lastPageLinkParameters () {
      let query = cloneDeep(this.$store.getters['search/toRouteQuery'])
      const gap = (this.response.total % query.size === 0) ? 1 : 0
      query.from = query.size * (floor(this.response.total / query.size) - gap)
      return { name: 'search', query }
    },
    isFirstOrPreviousPageAvailable () {
      return this.$store.state.search.from !== 0
    },
    isNextOrLastPageAvailable () {
      return this.$store.state.search.from + this.$store.state.search.size < this.$store.state.search.response.total
    }
  }
}
</script>

<style lang="scss">
  .search-results-header {

    &--bordered {
      &.search-results-header--top { border-bottom: 1px solid $gray-200; }
      &.search-results-header--bottom { border-top: 1px solid $gray-200; }
    }

    &__paging {
      padding: $spacer * 0.5 $spacer;
      font-size: 0.95em;
      color: $text-muted;
      display: inline-flex;
      width: 100%;

      &__progress {
        flex: 1 auto;

        > div {
          display: inline-block;
        }
      }

      &__angle,
      &__angle:hover {
        font-size: 1.1em;
        color: inherit;
        cursor: pointer;
      }

      .disabled {
        color: $gray-500;
        cursor: inherit;
      }
    }
  }
</style>
