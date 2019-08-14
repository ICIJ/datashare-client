<template>
  <div class="search" :class="{ 'search--show-document': showDocument }">
    <div class="d-flex">
      <button class="search__show-filters align-self-center ml-3 btn btn-link px-0" @click="clickOnShowFilters()" v-if="!showFilters" :title="$t('search.showFilters')" v-b-tooltip.right>
        <fa icon="arrow-right" />
        <span class="sr-only">{{ $t('search.showFilters') }}</span>
        <span class="search__show-filters__counter badge badge-warning badge-pill" v-if="activeFilters">{{ activeFilters }}</span>
      </button>
      <app-nav class="flex-grow-1" />
    </div>
    <div class="px-0 search__body">
      <vue-perfect-scrollbar class="search__body__search-results">
        <div v-if="!!error" class="py-5 text-center">
          {{ errorMessage }}
        </div>
        <search-results v-else-if="isReady" :response="response" :query.sync="query" />
        <div v-else>
          <content-placeholder />
          <content-placeholder />
          <content-placeholder />
        </div>
      </vue-perfect-scrollbar>
      <transition name="slide-right">
        <div class="search__body__document d-flex flex-column" v-if="showDocument">
          <search-document-navbar />
          <vue-perfect-scrollbar class="flex-grow-1">
            <router-view class="search__body__document__view" />
          </vue-perfect-scrollbar>
        </div>
      </transition>
      <router-link v-show="showDocument" class="search__body__backdrop" :to="{ name: 'search', query: toRouteQuery }"></router-link>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get'
import AppNav from '@/components/AppNav'
import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'
import SearchResults from '@/components/SearchResults'
import { mapState } from 'vuex'
import { errors as esErrors } from 'elasticsearch-browser'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'

export default {
  name: 'Search',
  components: {
    AppNav,
    SearchDocumentNavbar,
    SearchResults,
    VuePerfectScrollbar
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
    ...mapState('search', ['query', 'response', 'isReady', 'showFilters', 'error']),
    toRouteQuery () {
      return this.$store.getters['search/toRouteQuery']
    },
    showDocument () {
      return ['document'].indexOf(this.$route.name) > -1
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
    },
    showFilters: {
      get () {
        return this.$store.state.search.showFilters
      },
      set () {
        this.$store.commit('search/toggleFilters')
      }
    },
    activeFilters () {
      return this.$store.getters['search/activeFacets'].length
    }
  },
  beforeRouteUpdate (to, from, next) {
    if (to.name === 'search') {
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
    this.$root.$on('index::delete::all', this.search)
    this.$root.$on('facet::starred:refresh', this.search)
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
    },
    clickOnShowFilters () {
      this.showFilters = !this.showFilters
    }
  }
}
</script>

<style lang="scss">
  .search {
    @include clearfix();

    &__show-filters.btn {
      position: relative;
      display: block;
      height: 40px;
      width: 40px;
      flex-grow: 40px;
      min-width: 1;
      text-align: center;
      line-height: 40px;
      border-radius: 1.5rem;
      padding: 0;
      border-radius: 20px;
      background: $aggregations-panel-bg;
      color: white;

      &:hover {
        background: lighten($aggregations-panel-bg, 10%);
        color: white;
      }
    }

    &__show-filters__counter.badge.badge-pill {
      position: absolute;
    }

    &__body {
      height: calc(100vh - var(--app-nav-height));
      position: relative;
      overflow: hidden;

      &__document, &__search-results {
        position: absolute;
        z-index: 10;
        top: 0;
        bottom: $spacer;
      }

      &__search-results {
        left: $spacer;
        background: white;
        width: calc(#{$search-results-width}  - #{$spacer * 2});
        border-radius: $card-border-radius;
      }

      &__document {
        right: $spacer;
        padding: 0;
        margin: 0;

        width: 100%;
        max-width: calc(100% - #{$search-results-width} - #{$spacer});
        border-radius: $card-border-radius;

        &.slide-right-enter-active, &.slide-right-leave-active {
          transition: .3s;
        }

        &.slide-right-enter, &.slide-right-leave-to {
          transform: translateX(100%);
          opacity: 0;
        }

        .document {
          min-height: 100vh;
          box-shadow: 0 2px 10px 0 rgba(black,.05), 0 2px 30px 0 rgba(black,.02);
        }

        @media (max-width: $document-float-breakpoint-width) {
          right: 0;
          width: $document-min-width;
          max-width: calc(100vw - var(--app-sidebar-width));
          background: white;
          border-radius: 0;

          z-index: 20;
          position: fixed;
          top: 0;
          bottom: 0;
          box-shadow: $modal-content-box-shadow-sm-up;
        }
      }

      &__backdrop {
        cursor: pointer;
        z-index: 15;
        position: fixed;
        top: 0;
        bottom: 0;
        width: 100%;
        background: rgba($modal-backdrop-bg, $modal-backdrop-opacity);
        display: none;

        @media (max-width: $document-float-breakpoint-width) {
          display: block;
        }
      }
    }
  }
</style>
