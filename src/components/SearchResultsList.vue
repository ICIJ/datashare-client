<template>
  <div class="search-results-list">
    <div v-if="hasResults">
      <search-results-header position="top" :no-labels="true" bordered class="px-3"></search-results-header>
      <div class="search-results-list__items">
        <div v-for="document in response.hits" :key="document.id" :data-document-id="document.id" class="search-results-list__items__item mw-100">
          <search-results-list-link
            class="search-results-list__items__item__link"
            :document="document"></search-results-list-link>
          <div>
            <document-actions
              class="search-results-list__items__item__actions"
              :document="document"
              :is-download-allowed="isDownloadAllowed"
              tooltips-placement="right"
              vertical></document-actions>
          </div>
        </div>
      </div>
      <search-results-header position="bottom" bordered class="px-3"></search-results-header>
    </div>
    <div v-else>
      <search-results-header position="top" bordered class="px-3"></search-results-header>
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
  watch: {
    $route (to, from) {
      const documentId = to.params.id
      const searchListItems = [...this.$el.querySelectorAll('.search-results-list__items__item')]

      let target = searchListItems.filter((item) => {
        return item.dataset.documentId === documentId
      })
      target = target[0]

      target.scrollIntoView({ behavior: 'instant', block: 'nearest' })
    }
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

<style lang="scss" scoped>
  .search-results-list {
    background: white;
    border-radius: $card-border-radius;

    &__toolbar {
      background: $tertiary;
      color: white;
      font-size: 0.85rem;
      line-height: $line-height-base * (1 - (85 - 95) / 95);
      padding: 0.5rem 0;

      &.slide-up-enter-active, &.slide-up-leave-active {
        transition: .3s;
      }

      &.slide-up-enter, &.slide-up-leave-to {
        // Works with only one row
        margin-top: calc(#{-1em * $line-height-base} - #{$spacer * 1});
        opacity: 0;
      }

      .nav-link {
        color: mix($tertiary, text-contrast($tertiary), .7)
      }
    }

    &__items {
      &__item {
        direction: row;
        display: flex;
        flex-wrap: nowrap;
        max-width: 100%;
        overflow: hidden;

        &:hover, &:hover &__link {
          background: mix($secondary, white, 5%);
          text-decoration: none;
        }

        &__actions {
          margin: $spacer;
          visibility: hidden;

          /deep/ .btn {
            font-size: 0.9rem;
            padding: $spacer * 0.10 $spacer * 0.25;
            transition: none;
          }

          /deep/ .document-actions__star {
            &.starred {
              border-color: transparent;
              box-shadow: none;
              visibility: visible;
            }
          }
        }

        &:hover &__actions {
          visibility: visible;

          /deep/ .btn {
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
