<template>
  <div class="search-results-list">
    <div v-if="hasResults">
      <search-results-list-link :response="response" :position="'top'" />
      <div class="search-results-list__items">
        <div v-for="document in response.hits" :key="document.id" class="search-results-list__items__item mw-100">
          <search-results-list-link class="search-results-list__items__item__link" :document="document" />
          <div>
            <document-actions :document="document" vertical class="search-results-list__items__item__actions" />
          </div>
        </div>
      </div>
      <search-results-list-link :response="response" :position="'bottom'" />
    </div>
    <div v-else>
      <div class="search-results-list__header border-0 py-5 d-flex flex-column text-center">
        <div class="search-results-list__header__number-of-results">
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
import DocumentActions from '@/components/DocumentActions'
import SearchResultsHeader from '@/components/SearchResultsHeader'
import SearchResultsListLink from '@/components/SearchResultsListLink'
import ResetFiltersButton from '@/components/ResetFiltersButton'
import settings from '@/utils/settings'

export default {
  name: 'SearchResults',
  props: ['response', 'query'],
  components: {
    DocumentActions,
    ResetFiltersButton,
    SearchResultsHeader,
    SearchResultsListLink
  },
  computed: {
    hasResults () {
      return this.response.hits.length > 0
    },
    hasFilters () {
      return this.$store.getters['search/activeFacets'].length > 0 || this.$store.state.search.field !== settings.defaultSearchField
    }
  },
  methods: {
    isStarred (documentId) {
      return this.starredDocuments.indexOf(documentId) >= 0
    },
    async toggleStarDocument (documentId) {
      try {
        await this.$store.dispatch('search/toggleStarDocument', documentId)
      } finally {
        this.$root.$emit('facet::starred:refresh')
      }
    }
  }
}
</script>

<style lang="scss">
  .search-results-list {

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
