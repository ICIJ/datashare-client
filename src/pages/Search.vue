<template>
  <div class="search" :class="{ 'search--show-document': showDocument, [`search--${layout}`]: true }">
    <div class="d-flex">
      <button class="search__show-filters align-self-center ml-3 btn btn-link px-0" @click="clickOnShowFilters()" v-if="!showFilters" :title="$t('search.showFilters')" v-b-tooltip.right>
        <fa icon="arrow-right" />
        <span class="sr-only">{{ $t('search.showFilters') }}</span>
        <b-badge pill variant="warning" class="search__show-filters__counter" v-if="activeFilters">{{ activeFilters }}</b-badge>
      </button>
      <app-nav class="flex-grow-1" />
    </div>
    <div class="px-0 search__body">
      <component :is="bodyWrapper" class="search__body__search-results search__body__results" ref="searchBodyScrollbar">
        <div v-if="!!error" class="py-5 text-center">
          {{ errorMessage }}
        </div>
        <search-results v-else-if="isReady" :layout="layout" />
        <div v-else>
          <content-placeholder class="bg-white p-3 mb-3" />
          <content-placeholder class="bg-white p-3 mb-3" />
          <content-placeholder class="bg-white p-3 mb-3" />
        </div>
      </component>
      <transition name="slide-right">
        <div class="search__body__document" v-if="showDocument">
          <search-document-navbar class="search__body__document__navbar"  />
          <div class="search__body__document__wrapper">
            <div class="overflow-auto">
              <router-view class="search__body__document__wrapper__view" />
            </div>
          </div>
        </div>
      </transition>
      <router-link v-show="showDocument" class="search__body__backdrop" :to="{ name: 'search', query: toRouteQuery }"></router-link>
    </div>
  </div>
</template>

<script>
import compact from 'lodash/compact'
import get from 'lodash/get'
import isEqual from 'lodash/isEqual'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import { errors as esErrors } from 'elasticsearch-browser'
import { mapState } from 'vuex'

import AppNav from '@/components/AppNav'
import SearchDocumentNavbar from '@/components/SearchDocumentNavbar'
import SearchResults from '@/components/SearchResults'

export default {
  name: 'Search',
  components: {
    AppNav,
    SearchDocumentNavbar,
    SearchResults
  },
  data () {
    return {
      errorMessages: {
        'BadRequest': 'search.errors.badRequest',
        'InternalServerError': 'search.errors.internalError',
        'NoConnections': 'search.errors.noConnections',
        'NotFound': 'search.errors.notFound',
        'ServiceUnavailable': 'search.errors.serviceUnavailable'
      }
    }
  },
  computed: {
    ...mapState('search', ['isReady', 'showFilters', 'error', 'layout']),
    ...mapState('document', { currentDocument: 'doc' }),
    toRouteQuery () {
      return this.$store.getters['search/toRouteQuery']
    },
    showDocument () {
      return ['document'].indexOf(this.$route.name) > -1
    },
    errorMessage () {
      const defaultMessage = this.$t('search.errors.somethingWrong')
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
    },
    bodyWrapper () {
      return this.layout === 'list' ? VuePerfectScrollbar : 'div'
    }
  },
  beforeRouteUpdate (to, from, next) {
    if (to.name === 'search' && this.isDifferentFromQuery(to.query)) {
      this.$store.dispatch('search/updateFromRouteQuery', to.query)
        .catch(this.wrongQuery)
        .then(this.search)
        .then(next)
    } else {
      next()
    }
  },
  created () {
    this.$store.dispatch('search/updateFromRouteQuery', this.$route.query)
      .catch(this.wrongQuery)
      .then(this.search)
  },
  mounted () {
    this.$root.$on('index::delete::all', this.search)
    this.$root.$on('facet::starred::refresh', this.refresh)
    this.$root.$on('document::content::changed', this.updateScrollBars)
  },
  watch: {
    isReady (isReady) {
      const method = isReady ? 'finish' : 'start'
      this.$Progress[method]()
      this.updateScrollBars()
    },
    $route () {
      this.updateScrollBars()
    },
    currentDocument () {
      this.updateScrollBars()
    }
  },
  methods: {
    async search (queryOrParams) {
      try {
        return this.$store.dispatch('search/query', queryOrParams)
      } catch (_) {
        this.wrongQuery()
      }
    },
    async refresh () {
      try {
        return this.$store.dispatch('search/refresh', false)
      } catch (_) {
        this.wrongQuery()
      }
    },
    wrongQuery () {
      this.$Progress.finish()
    },
    clickOnShowFilters () {
      this.showFilters = !this.showFilters
    },
    isDifferentFromQuery (query) {
      return !isEqual(query, this.$store.getters['search/toRouteQuery'])
    },
    updateScrollBars () {
      const refs = [this.$refs.searchBodyScrollbar]
      compact(refs).map(ref => {
        if (ref && ref.ps) return ref.ps.update()
      })
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
      padding: 0;
      border-radius: 20px;
      background: $app-context-sidebar-bg;
      color: white;

      &:hover {
        background: lighten($app-context-sidebar-bg, 10%);
        color: white;
      }
    }

    .btn &__show-filters__counter.badge {
      position: absolute;
    }

    &--grid, &--table {

      &.search .search__body__backdrop {
        display: block;
      }

      &.search .search__body__document {
        z-index: 20;
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        width: $document-min-width;
        max-width: calc(100vw - var(--app-sidebar-width));
        background: white;
        border-radius: 0;
        box-shadow: $modal-content-box-shadow-sm-up;
      }
    }

    &--list {

      &.search .search__body__results {
        right: auto;
        background: white;
        width: calc(#{$search-results-list-width}  - #{$spacer * 2});
      }

      &.search .search__body__document,
      &.search .search__body__results {
        box-shadow: 0 2px 10px 0 rgba(black, .05), 0 2px 30px 0 rgba(black, .02);
        border-radius: $card-border-radius;
        overflow: hidden;
      }

    }

    &__body {
      height: calc(100vh - var(--app-nav-height));
      position: relative;
      overflow: hidden;

      & &__document, & &__results {
        position: absolute;
        z-index: 10;
        top: 0;
        bottom: $spacer;
      }

      & &__results {
        left: $spacer;
        right: $spacer;
        overflow: auto;
      }

      & &__document {
        z-index: 20;
        right: $spacer;
        padding: 0;
        margin: 0;
        flex: 1 0 auto;
        display: flex;
        flex-direction: column;

        width: 100%;
        max-width: calc(100% - #{$search-results-list-width} - #{$spacer});

        &.slide-right-enter-active, &.slide-right-leave-active {
          transition: .3s;
        }

        &.slide-right-enter, &.slide-right-leave-to {
          transform: translateX(100%);
          opacity: 0;
        }

        &__wrapper {
          position: relative;
          flex-grow: 1;

          & > * {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }

          &__view {
            min-height: 100%;
            display: flex;
            flex-direction: column;
            width: 100%;
            overflow: hidden;

            .document {
              flex-grow: 1;
              min-height: 100%;
            }
          }
        }

        @media (max-width: $document-float-breakpoint-width) {
          z-index: 20;
          position: fixed;
          top: 0;
          bottom: 0;
          right: 0;
          width: $document-min-width;
          max-width: calc(100vw - var(--app-sidebar-width));
          background: white;
          border-radius: 0;
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
