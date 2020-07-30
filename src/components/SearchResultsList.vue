<template>
  <div class="search-results-list">
    <div v-if="hasResults">
      <search-results-header position="top" bordered class="px-3" />
      <div class="search-results-list__items">
        <div v-for="document in response.hits" :key="document.id" class="search-results-list__items__item mw-100">
          <search-results-list-link class="search-results-list__items__item__link" :document="document" />
          <div>
            <document-actions :document="document" vertical class="search-results-list__items__item__actions" :is-download-allowed="isDownloadAllowed" tooltips-placement="right" />
          </div>
        </div>
      </div>
      <search-results-header position="bottom" bordered class="px-3" />
    </div>
    <div v-else>
      <search-results-header position="top" bordered class="px-3" />
      <div class="search-results-list__header border-0 py-5 d-flex flex-column text-center">
        <div class="search-results-list__header__number-of-results">
          {{ $t('search.results.noResults') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import DocumentActions from '@/components/DocumentActions'
import SearchResultsHeader from '@/components/SearchResultsHeader'
import SearchResultsListLink from '@/components/SearchResultsListLink'
import settings from '@/utils/settings'

/**
 * Display search results as list.
 */
export default {
  name: 'SearchResultsList',
  components: {
    DocumentActions,
    SearchResultsHeader,
    SearchResultsListLink
  },
  computed: {
    ...mapState('search', ['query', 'response', 'isDownloadAllowed']),
    hasResults () {
      return this.response.hits.length > 0
    },
    hasFilters () {
      return this.$store.getters['search/activeFilters'].length > 0 || this.$store.state.search.field !== settings.defaultSearchField
    }
  }
}
</script>

<style lang="scss">
  .search-results-list {
    background: white;
    border-radius: $card-border-radius;

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

        &:hover, &:hover &__link {
          text-decoration: none;
          background: mix($secondary, white, 5%);
        }

        &__actions {
          margin: $spacer;
          visibility: hidden;

          .btn {
            transition: none;
            font-size: 0.9rem;
            padding: $spacer * 0.10 $spacer * 0.25;
          }

          .document-actions__star {
            &.starred {
              border-color: transparent;
              box-shadow: none;
              visibility: visible;
            }
          }
        }

        &:hover &__actions {
          visibility: visible;

          .btn {
            background: white;
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
