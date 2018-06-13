<template>
  <div class="search-results">
    <div v-if="query && response.hits.length > 0">
      <div class="search-results__header">
        <div class="search-results__header__number-of-results">{{ $tc('search.results.results', response.hits.length, {total: response.get('hits.total')}) }}</div>
        <div class="search-results__header__pagination" @click="nextPage">{{ $tc('search.nextpage') }}</div>
      </div>
      <div class="search-results__items">
        <search-results-item v-for="doc in response.hits" :key="doc.id" :doc="doc" />
      </div>
    </div>
    <div v-else>
      <div class="search-results__header">
        <div class="search-results__header__number-of-results">{{ $t('search.results.no-result') }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import SearchResultsItem from './SearchResultsItem.vue'

export default {
  name: 'SearchResults',
  props: ['response', 'query'],
  components: { SearchResultsItem },
  methods: {
    nextPage () {
      this.$store.dispatch('search/nextPage')
    }
  }
}
</script>

<style lang="scss">
  .search-results {

    &__header {
      padding: $spacer * 0.5 $spacer;
      border-bottom: 1px solid $gray-200;
      font-size: 0.95em;
      color: $text-muted;
    }
  }
</style>
