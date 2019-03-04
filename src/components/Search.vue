<template>
  <div class="search" :class="{ 'search--show-document': showDocument }">
    <div class="container-fluid px-0 search__body">
      <div class="row no-gutters">
        <aggregations-panel class="col search__body__aggregations-panel" />
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
            {{ $t('search.back') }}
          </router-link>
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AggregationsPanel from '@/components/AggregationsPanel'
import SearchResults from '@/components/SearchResults'
import ContentPlaceholder from '@/components/ContentPlaceholder'
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
      query: 'query',
      searchResponse: 'response',
      isReady: 'isReady'
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
        max-width: $aggregations-panel-width;
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
      }
    }
  }
</style>
