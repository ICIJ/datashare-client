<template>
  <div class="search-results">
    <div v-if="query && response.hits.length > 0">
      <search-results-header :response="response" :position="'top'" />
      <div class="search-results__items">
        <search-results-item v-for="doc in response.hits" :key="doc.id" :doc="doc" />
      </div>
      <search-results-header :response="response" :position="'bottom'" />
    </div>
    <div v-else>
      <div class="search-results__header">
        <div class="search-results__header__number-of-results">{{ $t('search.results.no-result') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import SearchResultsHeader from './SearchResultsHeader.vue'
import SearchResultsItem from './SearchResultsItem.vue'

export default {
  name: 'SearchResults',
  props: ['response', 'query'],
  components: { SearchResultsHeader, SearchResultsItem }
}
</script>

<style lang="scss">
  .search-results {

    &__header {
      padding: $spacer * 0.5 $spacer;
      border-bottom: 1px solid $gray-200;
      font-size: 0.95em;
      color: $text-muted;
      display: inline-flex;
      width: 100%;

      > div {
        &.search-results__header__progress {
          flex: 1 auto;
          text-align: center;

          > div {
            display: inline-block;
          }
        }

        &.search-results__header__first-page,
        &.search-results__header__previous-page,
        &.search-results__header__next-page,
        &.search-results__header__last-page {
          cursor: pointer;
        }

        &.disabled {
          color: $gray-500;
          cursor: inherit;
        }
      }
    }
  }
</style>
