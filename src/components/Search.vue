<template>
  <div class="search" :class="{ 'search--show-document': showDocument }">
    <div class="px-0 search__body">
      <div class="search__body__wrapper">
        <aggregations-panel class="search__body__aggregations-panel" />
        <div class="search__body__search-results my-3 ml-3">
          <div v-if="!!error" class="py-5 text-center">
            {{ errorMessage }}
          </div>
          <search-results v-else-if="isReady" :response="response" :query.sync="query" :starred-documents="starredDocuments" />
          <div v-else>
            <content-placeholder />
            <content-placeholder />
            <content-placeholder />
          </div>
        </div>
      </div>
      <transition>
        <div class="search__body__document " :class="showFilters ? 'show-filters' : 'show-filters'" v-show="showDocument">
          <search-document-navbar />
          <router-view class="search__body__document__view"></router-view>
          <router-link :to="{ name: 'search', query }" class="search__body__document__backdrop" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get'
import AggregationsPanel from '@/components/AggregationsPanel'
import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'
import SearchResults from '@/components/SearchResults'
import { EventBus } from '@/utils/event-bus'
import { mapState } from 'vuex'
import { errors as esErrors } from 'elasticsearch-browser'

export default {
  name: 'Search',
  components: {
    AggregationsPanel,
    SearchDocumentNavbar,
    SearchResults
  },
  data () {
    return {
      errorMessages: {
        'BadRequest': 'search.errors.bad-request',
        'InternalServerError': 'search.errors.internal-error',
        'NoConnections': 'search.errors.no-connections',
        'NotFound': 'search.errors.not-found',
        'ServiceUnavailable': 'search.errors.service-unavailable'
      }
    }
  },
  computed: {
    ...mapState('search', ['query', 'response', 'starredDocuments', 'isReady', 'showFilters', 'error']),
    showDocument () {
      return ['document', 'email'].indexOf(this.$route.name) > -1
    },
    errorMessage () {
      const defaultMessage = this.$t('search.errors.something-wrong')
      for (const type in this.errorMessages) {
        // The error is an instance of the key and it exist as a translation key
        if (this.error instanceof esErrors[type] && this.$te(this.errorMessages[type])) {
          return this.$t(this.errorMessages[type])
        }
      }
      return get(this.error, 'body.error.root_cause.0.reason', defaultMessage)
    }
  },
  beforeRouteUpdate (to, from, next) {
    if (to.name === 'search') {
      // Update the search's store using route query
      this.$store.dispatch('search/updateFromRouteQuery', to.query)
        .catch(this.wrongQuery)
        .then(this.search)
        .then(next)
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
    async search (queryOrParams) {
      try {
        const result = await this.$store.dispatch('search/query', queryOrParams)
        return result
      } catch (_) {
        this.wrongQuery()
      }
    },
    wrongQuery () {
      this.$Progress.finish()
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
        position: relative;
        width: $aggregations-panel-width;
        z-index: 20;
      }

      &__search-results {
        background: white;
        position: relative;
        z-index: 10;
        max-width: $search-results-width;
        min-width: $search-results-width;
        min-height: 100%;
        overflow: auto;
        border-radius: $card-border-radius;
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
        border-radius: $card-border-radius;

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
            box-shadow: $modal-content-box-shadow-sm-up;
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
          border-radius: 0;

          &__backdrop {
            cursor: auto;
            z-index: -1;
            position: absolute;
            right: 100%;
            top: 0;
            bottom: 0;
            width: calc(100vw - #{$document-min-width});
            background: rgba($modal-backdrop-bg, $modal-backdrop-opacity);
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
