<template>
  <div class="search" :class="{ 'search--show-document': showDocument }">
    <div class="container-fluid px-0 search__body">
      <div class="row no-gutters">
        <div class="col search__body__aggregations-panel">
          <aggregations-panel />
        </div>
        <div class="col search__body__search-results">
          <search-results v-if="isReady" :response="searchResponse" :query.sync="query" />
          <div v-else>
            <content-placeholder />
            <content-placeholder />
            <content-placeholder />
          </div>
        </div>
        <div class="col search__body__document" v-show="showDocument">
          <router-link :to="{ name: 'search', query: searchQuery }" class="p-2 mx-2 mt-1 d-none d-md-inline-block d-xl-none">
            Back to the search results
          </router-link>
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Components
import AggregationsPanel from './AggregationsPanel'
import SearchResults from './SearchResults'
import ContentPlaceholder from './ContentPlaceholder'

import { mapState } from 'vuex'

export default {
  name: 'Search',
  components: {
    AggregationsPanel,
    SearchResults,
    ContentPlaceholder
  },
  beforeRouteUpdate (to, from, next) {
    if (to.name === 'search') {
      // Query is empty
      if ([null, undefined, ''].indexOf(to.query.q) > -1) {
        // Redirect to landing page
        return next({ name: 'landing' })
      }
      // Update the search's store using route query
      this.$store.dispatch('search/updateFromRouteQuery', to.query).then(this.search).then(next)
    } else {
      next()
    }
  },
  created () {
    this.search()
  },
  computed: {
    ...mapState('search', {
      query: state => state.query,
      searchResponse: state => state.response,
      isReady: state => state.isReady
    }),
    searchQuery () {
      return this.$store.getters['search/toRouteQuery']
    },
    showDocument () {
      return this.$route.name === 'document'
    }
  },
  methods: {
    search (queryOrParams) {
      return this.$store.dispatch('search/query', queryOrParams)
    }
  },
  watch: {
    isReady (isReady) {
      const method = isReady ? 'finish' : 'start'
      this.$Progress[method]()
    }
  }
}
</script>

<style lang="scss">
  .search {
    background: $aggregations-panel-bg;

    &__body {

      &__aggregations-panel.col {
        max-width: 320px;
        min-height: calc(100vh - #{$app-nav-height});

        @include media-breakpoint-down(lg) {
          .search--show-document & {
            display: none;
          }
        }
      }

      &__search-results.col {
        background: white;
        position: relative;
        max-width: 550px;
        overflow: auto;
        border-left: 1px solid $gray-200;
        border-right: 1px solid $gray-200;

        @include media-breakpoint-down(lg) {
          .search--show-document & {
            display: none;
            max-width: 100%;
          }
        }
      }

      &__document {
        background: $aggregations-panel-bg;

        .document {
          box-shadow: 0 2px 10px 0 rgba(black,.05), 0 2px 30px 0 rgba(black,.02);
          border: $gray-200 1px solid;
          margin: $spacer auto;
          background: white;
          min-height: 90vh;
          max-width: 880px;

          @media (max-width: 1780px) {
            margin-top: 0;
          }

          @include media-breakpoint-down(lg) {
            margin-top: $spacer;
          }
        }
      }
    }
  }
</style>
