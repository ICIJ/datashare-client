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
      <transition>
        <div class="search__body__document " :class="showFilters ? 'show-filters' : 'hide-filters'" v-show="showDocument">
          <search-document-navbar />
          <router-view class="search__body__document__view"></router-view>
          <div class="search__body__document__backdrop"></div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import AggregationsPanel from '@/components/AggregationsPanel'
import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'
import SearchResults from '@/components/SearchResults'
import { EventBus } from '@/utils/event-bus'
import { mapState } from 'vuex'

export default {
  name: 'Search',
  components: {
    AggregationsPanel,
    SearchDocumentNavbar,
    SearchResults
  },
  computed: {
    ...mapState('search', {
      query: 'query',
      searchResponse: 'response',
      isReady: 'isReady',
      showFilters: 'showFilters'
    }),
    showDocument () {
      return ['document', 'email'].indexOf(this.$route.name) > -1
    }
  },
  beforeRouteUpdate (to, from, next) {
    if (to.name === 'search' && this.$store.getters['search/queryHasChanged'](from.query, to.query)) {
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
      display: flex;
      flex-wrap: nowrap;

      &__wrapper {
        display: flex;
        float: left;
        align-items: flex-start;
        min-height: calc(100vh - var(--app-nav-height) - var(--app-footer-height));
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

      &__aggregations-panel, &__search-results, &__document {
        align-self: flex-end;
        position: sticky;
        bottom: var(--app-footer-height);
        min-height: calc(100vh - var(--app-footer-height));
      }

      & &__document {
        padding: 0;
        width: 100%;
        max-width: calc(100% - #{$search-results-width} - #{$aggregations-panel-width});

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

        &__view {
          padding: $spacer;
          padding-top: 0;

          @media (max-width: $document-float-breakpoint-width) {
            padding: 0;
            margin-bottom: var(--app-footer-height);
          }
        }

        @media (max-width: $document-float-breakpoint-width) {
          display: block;
          z-index: 100;
          position: sticky;
          right: 0;
          padding: 0;
          margin: 0;
          min-width: $document-min-width;
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

        @media (max-width: $document-min-width) {
          width: 100%;
          min-width: 100%;
        }
      }
    }
  }
</style>
