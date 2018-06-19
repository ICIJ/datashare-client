<template>
  <div class="search-results">
    <div v-if="query && response.hits.length > 0">
      <div class="search-results__header">
        <div @click="firstPage" v-bind:class="[isFirstOrPreviousPageAvailable() ? '' : 'disabled', 'search-results__header__first-page']">
          <font-awesome-icon icon="angle-double-left" />
        </div>
        <div @click="previousPage" v-bind:class="[isFirstOrPreviousPageAvailable() ? '' : 'disabled', 'search-results__header__previous-page']">
          <font-awesome-icon icon="angle-left" />
        </div>
        <div class="search-results__header__progress">
          <div class="search-results__header__progress__pagination">
            {{ $store.state.search.from + 1 }} - {{ $store.state.search.from + $store.state.search.size }}
          </div>
          <div class="search-results__header__progress_number-of-results">
            {{ $tc('search.results.on') }} {{ $tc('search.results.results', response.hits.length, {total: response.get('hits.total')}) }}
          </div>
        </div>
        <div @click="nextPage" v-bind:class="[isNextOrLastPageAvailable() ? '' : 'disabled', 'search-results__header__next-page']">
          <font-awesome-icon icon="angle-right" />
        </div>
        <div @click="lastPage" v-bind:class="[isNextOrLastPageAvailable() ? '' : 'disabled', 'search-results__header__last-page']">
          <font-awesome-icon icon="angle-double-right" />
        </div>
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
    firstPage () {
      if (this.isFirstOrPreviousPageAvailable()) {
        this.$store.dispatch('search/firstPage')
      }
    },
    previousPage () {
      if (this.isFirstOrPreviousPageAvailable()) {
        this.$store.dispatch('search/previousPage')
      }
    },
    nextPage () {
      if (this.isNextOrLastPageAvailable()) {
        this.$store.dispatch('search/nextPage')
      }
    },
    lastPage () {
      if (this.isNextOrLastPageAvailable()) {
        this.$store.dispatch('search/lastPage')
      }
    },
    isFirstOrPreviousPageAvailable () {
      return this.$store.state.search.from !== 0
    },
    isNextOrLastPageAvailable () {
      return this.$store.state.search.from + this.$store.state.search.size < this.$store.state.search.response.total
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
      display: inline-flex;
      width: 100%;

      > div {
        padding: 0.3rem;

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
