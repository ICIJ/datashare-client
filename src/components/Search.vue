<template>
  <div class="search" :class="{ 'search--show-document': showDocument }">
    <div class="px-0 search__body">
      <div class="search__body__wrapper">
        <aggregations-panel class="search__body__aggregations-panel" />
        <div class="search__body__search-results">
          <search-results v-if="isReady" :response="searchResponse" :query.sync="query" />
          <div v-else>
            <content-placeholder />
            <content-placeholder />
            <content-placeholder />
          </div>
        </div>
      </div>
      <transition name="slide-right">
        <div class="search__body__document" :class="showFilters ? 'show-filters' : 'hide-filters'" v-show="showDocument">
          <router-link :to="{ name: 'search', query: searchQuery }" class="p-2 search__body__document__nav">
            <fa icon="chevron-circle-left" />
            {{ $t('search.back') }}
          </router-link>
          <router-view></router-view>
          <div class="search__body__document__backdrop"></div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import AggregationsPanel from '@/components/AggregationsPanel'
import SearchResults from '@/components/SearchResults'
import { EventBus } from '@/utils/event-bus'
import { mapState } from 'vuex'

export default {
  name: 'Search',
  components: {
    AggregationsPanel,
    SearchResults
  },
  computed: {
    ...mapState('search', {
      query: 'query',
      searchResponse: 'response',
      isReady: 'isReady',
      showFilters: 'showFilters'
    }),
    searchQuery () {
      return this.$store.getters['search/toRouteQuery']
    },
    showDocument () {
      return this.$route.name === 'document'
    }
  },
  beforeRouteUpdate (to, from, next) {
    if (to.name === 'search') {
      // Update the search's store using route query
      this.$store.dispatch('search/updateFromRouteQuery', to.query).then(this.search).then(next)
    } else {
      next()
    }
  },
  created () {
    this.search()
  },
  mounted () {
    EventBus.$on('index::delete::all', this.search)
  },
  watch: {
    isReady (isReady) {
      const method = isReady ? 'finish' : 'start'
      this.$Progress[method]()
    }
  },
  methods: {
    search (queryOrParams) {
      return this.$store.dispatch('search/query', queryOrParams)
    }
  }
}
</script>

<style lang="scss">
  .search {
    @include clearfix();

    &__body {

      &__wrapper {
        float: left;
        display: flex;

        .search--show-document & {
          @media (max-width: $document-float-breakpoint-width) {
            overflow: auto;
            position: fixed;
            top: var(--app-nav-height);
            height: calc(100% - var(--app-nav-height) - var(--app-footer-height));
            width: 100%;
          }
        }
      }

      &__aggregations-panel {
        width: $aggregations-panel-width;
      }

      &__search-results {
        background: white;
        position: relative;
        z-index: 0;
        max-width: $search-results-width;
        min-width: $search-results-width;
        min-height: 100%;
        overflow: auto;
        border-left: 1px solid $gray-200;
        border-right: 1px solid $gray-200;
      }

      & &__document {
        padding: $spacer;
        margin-left: $aggregations-panel-width + $search-results-width;

        &.hide-filters {
          margin-left: $search-results-width;
        }

        &.slide-right-enter-active, &.slide-right-leave-active {
          transition: .3s;
        }

        &.slide-right-enter, &.slide-right-leave-to {
          opacity: 0;
          transform: translateX(100%);
        }

        .document {
          box-shadow: 0 2px 10px 0 rgba(black,.05), 0 2px 30px 0 rgba(black,.02);
        }

        &__nav {
          display: none;
          background: darken($primary, 10);
          color: white;

          @media (max-width: $document-float-breakpoint-width) {
            display: block;
          }
        }

        @media (max-width: $document-float-breakpoint-width) {
          display: block;
          z-index: 100;
          position: absolute;
          top: var(--app-nav-height);
          right: 0;
          padding: 0;
          margin: 0;
          width: $document-min-width;
          max-width: calc(100vw - #{$spacer});
          min-height: 100vh;
          background: white;

          .document {
            box-shadow: none;
          }

          &__backdrop {
            pointer-events: none;
            z-index: -1;
            position: absolute;
            right: 100%;
            top: 0;
            bottom: 0;
            width: calc(100vw - #{$document-min-width});
            @include gradient-x(rgba($dark, 0), rgba($dark, 0.4))
          }
        }
      }
    }
  }
</style>
