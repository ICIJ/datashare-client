<template>
  <div class="search-results">
    <transition name="slide-up">
      <div class="nav search-results__toolbar p-0" v-show="!showFilters">
        <li class="nav-item">
          <a class="nav-link text-uppercase font-weight-bold" href @click.prevent="clickOnShowFilters()">
            <font-awesome-icon icon="filter" />
            {{ $t('search.showFilters') }}
          </a>
        </li>
      </div>
    </transition>
    <div v-if="query && response.hits.length > 0">
      <search-results-header :response="response" :position="'top'" />
      <div class="search-results__items">
        <search-results-item v-for="doc in response.hits" :key="doc.id" :doc="doc" />
      </div>
      <search-results-header :response="response" :position="'bottom'" />
    </div>
    <div v-else>
      <div class="search-results__header border-0 d-flex justify-content-center align-items-center py-5">
        <div class="search-results__header__number-of-results">
          {{ $t('search.results.no-result') }}
        </div>
        <div class="ml-2">
          {{ $t('search.try') }}
          <reset-filters-button />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SearchResultsHeader from '@/components/SearchResultsHeader'
import SearchResultsItem from '@/components/SearchResultsItem'
import ResetFiltersButton from '@/components/ResetFiltersButton'

export default {
  name: 'SearchResults',
  props: ['response', 'query'],
  components: { SearchResultsHeader, SearchResultsItem, ResetFiltersButton },
  computed: {
    showFilters: {
      get () {
        return this.$store.state.search.showFilters
      },
      set () {
        this.$store.commit('search/toggleFilters')
      }
    }
  },
  methods: {
    clickOnShowFilters () {
      this.showFilters = !this.showFilters
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
