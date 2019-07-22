<template>
  <div class="search-results">
    <transition name="slide-up">
      <div class="nav search-results__toolbar p-0" v-show="!showFilters">
        <li class="nav-item">
          <a class="nav-link font-weight-bold" href @click.prevent="clickOnShowFilters()">
            <fa icon="filter" />
            {{ $t('search.showFilters') }}
          </a>
        </li>
      </div>
    </transition>
    <div v-if="hasResults">
      <search-results-header :response="response" :position="'top'" />
      <div class="search-results__items">
        <div v-for="doc in response.hits" :key="doc.id" class="search-results__items__item mw-100">
          <search-results-link class="search-results__items__item__link" :doc="doc" />
          <div class="">
            <div class="search-results__items__item__actions btn-group-vertical">
              <a class="search-results__items__item__star btn btn-outline-primary btn-sm" :class="[isStarred(doc.id) ? 'starred' : '']" href @click.prevent="" :title="$t('document.star_file')" @click="toggleStarDocument(doc.id)" v-b-tooltip.left>
                <fa :icon="[isStarred(doc.id) ? 'fa' : 'far', 'star']" fa-fw />
                <span class="sr-only">{{ $t('document.star_button') }}</span>
              </a>
              <a class="search-results__items__item__download btn btn-outline-primary btn-sm" :href="doc.fullUrl" target="_blank" :title="$t('document.download_file')" v-b-tooltip.left>
                <fa icon="download" fa-fw />
                <span class="sr-only">{{ $t('document.download_button') }}</span>
              </a>
              <router-link-popup :to="{ name: 'document-simplified', params: doc.routerParams }" class="btn btn-sm btn-outline-primary" :title="$t('document.external_window')" v-b-tooltip.left>
                <fa icon="external-link-alt" fa-fw />
              </router-link-popup>
            </div>
          </div>
        </div>
      </div>
      <search-results-header :response="response" :position="'bottom'" />
    </div>
    <div v-else>
      <div class="search-results__header border-0 py-5 d-flex flex-column text-center">
        <div class="search-results__header__number-of-results">
          {{ $t('search.results.no-result') }}
        </div>
        <div class="mt-3" v-if="hasFilters">
          {{ $t('search.try') }}
          <reset-filters-button />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import SearchResultsHeader from '@/components/SearchResultsHeader'
import SearchResultsLink from '@/components/SearchResultsLink'
import ResetFiltersButton from '@/components/ResetFiltersButton'
import RouterLinkPopup from '@/components/RouterLinkPopup'
import settings from '@/utils/settings'

export default {
  name: 'SearchResults',
  props: ['response', 'query'],
  components: {
    SearchResultsHeader,
    SearchResultsLink,
    ResetFiltersButton,
    RouterLinkPopup
  },
  computed: {
    ...mapState('search', ['starredDocuments']),
    showFilters: {
      get () {
        return this.$store.state.search.showFilters
      },
      set () {
        this.$store.commit('search/toggleFilters')
      }
    },
    hasResults () {
      return this.response.hits.length > 0
    },
    hasFilters () {
      return this.$store.getters['search/activeFacets'].length > 0 || this.$store.state.search.field !== settings.defaultSearchField
    }
  },
  methods: {
    clickOnShowFilters () {
      this.showFilters = !this.showFilters
    },
    isStarred (documentId) {
      return this.starredDocuments.indexOf(documentId) >= 0
    },
    toggleStarDocument (documentId) {
      return this.$store.dispatch('search/toggleStarDocument', documentId).then(() => {
        this.$root.$emit('facet::starred:refresh')
      })
    }
  }
}
</script>

<style lang="scss">
  .search-results {

    &__toolbar {
      font-size: 0.85rem;
      line-height: $line-height-base * (1 - (85 - 95) / 95);
      padding: 0.5rem 0;
      color: white;
      background: $tertiary;

      &.slide-up-enter-active, &.slide-up-leave-active {
        transition: .3s;
      }

      &.slide-up-enter, &.slide-up-leave-to {
        opacity: 0;
        // Works with only one row
        margin-top: calc(#{-1em * $line-height-base} - #{$spacer * 1});
      }

      .nav-link {
        color: mix($tertiary, text-contrast($tertiary), .7)
      }
    }

    &__items {

      &__item {
        max-width: 100%;
        overflow: hidden;
        display: flex;
        flex-wrap: nowrap;
        direction: row;
        border-bottom: 1px solid $gray-200;

        &:hover, &:hover &__link {
          text-decoration: none;
          background: mix($secondary, white, 5%);
        }

        &__actions {
          margin: $spacer $spacer * 0.5;
          visibility: hidden;

          .btn {
            background: white;
            transition: none;
            font-size: 0.9rem;
            padding: $spacer * 0.10 $spacer * 0.25;
          }
        }

        &__star {

          &.starred {
            border-color: transparent;
            box-shadow: none;
            visibility: visible;
          }

        }

        &:hover &__actions {
          visibility: visible;

          .btn {
            border-color: $primary;
          }
        }

        &__link {
          flex-grow: 1;
          min-width: 0;
        }
      }
    }
  }
</style>
