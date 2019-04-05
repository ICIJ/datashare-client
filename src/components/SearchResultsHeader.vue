<template>
  <div>
    <div class="search-results__header">
      <div class="search-results__header__paging">
        <router-link
             :to="firstPageLinkParameters()"
             :class="[isFirstOrPreviousPageAvailable() ? '' : 'disabled']"
             class="search-results__header__paging__first-page px-2"
             v-b-tooltip.hover :title="$t('search.results.firstPage')" v-if="response.total > $store.state.search.size">
          <fa icon="angle-double-left" />
        </router-link>
        <router-link
             :to="previousPageLinkParameters()"
             :class="[isFirstOrPreviousPageAvailable() ? '' : 'disabled']"
             class="search-results__header__paging__previous-page px-2"
             v-b-tooltip.hover :title="$t('search.results.previousPage')" v-if="response.total > $store.state.search.size">
          <fa icon="angle-left" />
        </router-link>
        <div class="search-results__header__paging__progress">
          <div class="search-results__header__paging__progress__pagination">
            {{ $store.state.search.from + 1 }} - {{ lastDocument }}
          </div>&nbsp;
          <div class="search-results__header__paging__progress_number-of-results">
            {{ $t('search.results.on') }} {{ $tc('search.results.results', response.total, { total: $n(response.get('hits.total')) }) }}
          </div>
        </div>
        <router-link
             :to="nextPageLinkParameters()"
             :class="[isNextOrLastPageAvailable() ? '' : 'disabled']"
             class="search-results__header__paging__next-page px-2"
             v-b-tooltip.hover :title="$t('search.results.nextPage')" v-if="response.total > $store.state.search.size">
          <fa icon="angle-right" />
        </router-link>
        <router-link
             :to="lastPageLinkParameters()"
             :class="[isNextOrLastPageAvailable() ? '' : 'disabled']"
             class="search-results__header__paging__last-page px-2"
             v-b-tooltip.hover :title="$t('search.results.lastPage')" v-if="response.total > $store.state.search.size">
          <fa icon="angle-double-right" />
        </router-link>
      </div>
      <div class="search-results__header__active-filters py-1" v-if="queryTerms.length">
        <b-badge v-for="term in queryTerms" :key="term" class="ml-2 search-results__header__active-filters__filter" @click.prevent="deleteQueryTerm(term)">
          {{ term }}
          <fa icon="times" />
        </b-badge>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'
import filter from 'lodash/filter'
import floor from 'lodash/floor'
import max from 'lodash/max'
import min from 'lodash/min'
import split from 'lodash/split'
import uniq from 'lodash/uniq'

export default {
  name: 'SearchResultsHeader',
  props: ['response', 'position'],
  computed: {
    ...mapState('search', {
      query: 'query'
    }),
    lastDocument () {
      return min([this.response.total, this.$store.state.search.from + this.$store.state.search.size])
    },
    queryTerms () {
      return filter(uniq(split(this.query, ' ')), i => i !== '*')
    }
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
      return { name: 'search', query: query }
    },
    previousPageLinkParameters () {
      let query = cloneDeep(this.$store.getters['search/toRouteQuery'])
      query.from = max([0, query.from - query.size])
      return { name: 'search', query: query }
    },
    nextPageLinkParameters () {
      let query = cloneDeep(this.$store.getters['search/toRouteQuery'])
      const nextFrom = query.from + query.size
      query.from = nextFrom < this.response.total ? nextFrom : query.from
      return { name: 'search', query: query }
    },
    lastPageLinkParameters () {
      let query = cloneDeep(this.$store.getters['search/toRouteQuery'])
      const gap = (this.response.total % query.size === 0) ? 1 : 0
      query.from = query.size * (floor(this.response.total / query.size) - gap)
      return { name: 'search', query: query }
    },
    isFirstOrPreviousPageAvailable () {
      return this.$store.state.search.from !== 0
    },
    isNextOrLastPageAvailable () {
      return this.$store.state.search.from + this.$store.state.search.size < this.$store.state.search.response.total
    },
    deleteQueryTerm (term) {
      this.$store.dispatch('search/deleteQueryTerm', term)
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
    }
  }
}
</script>

<style lang="scss">
  .search-results__header {
    &__paging {
      padding: $spacer * 0.5 $spacer;
      border-bottom: 1px solid $gray-200;
      font-size: 0.95em;
      color: $text-muted;
      display: inline-flex;
      width: 100%;

      &__progress {
        flex: 1 auto;
        text-align: center;

        > div {
          display: inline-block;
        }
      }

      &__first-page,
      &__first-page:hover,
      &__previous-page,
      &__previous-page:hover,
      &__next-page,
      &__next-page:hover,
      &__last-page,
      &__last-page:hover {
        color: inherit;
        cursor: pointer;
      }

      .disabled {
        color: $gray-500;
        cursor: inherit;
      }
    }

    &__active-filters {
      border-bottom: 1px solid $gray-200;

      &__filter {
        cursor: pointer;
      }
    }
  }
</style>
