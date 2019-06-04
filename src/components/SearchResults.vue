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
        <div v-for="doc in response.hits" :key="doc.id" class="search-results__items__item">
          <a class="search-results__items__item__download btn btn-outline-primary btn-sm float-right m-3" :href="doc.fullUrl" target="_blank" :title="$t('document.download_file')">
            <fa icon="download" />
            <span class="sr-only">{{ $t('document.download_button') }}</span>
          </a>
          <a class="search-results__items__item__star btn btn-outline-primary btn-sm float-right m-3" :href="doc.fullUrl" target="_blank" :title="$t('document.star_file')" v-if="hasFeature('BOOKMARKS')">
            <fa :icon="['far', 'star']" />
            <span class="sr-only">{{ $t('document.star_button') }}</span>
          </a>
          <search-results-link class="search-results__items__item__link" :doc="doc" />
        </div>
      </div>
      <search-results-header :response="response" :position="'bottom'" />
    </div>
    <div v-else>
      <div class="search-results__header border-0 py-5 d-flex flex-column text-center">
        <div class="search-results__header__number-of-results">
          {{ $t('search.results.no-result') }}
        </div>
        <div class="mt-3" v-if="hasFacets">
          {{ $t('search.try') }}
          <reset-filters-button />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SearchResultsHeader from '@/components/SearchResultsHeader'
import SearchResultsLink from '@/components/SearchResultsLink'
import ResetFiltersButton from '@/components/ResetFiltersButton'
import features from '@/mixins/features'

export default {
  name: 'SearchResults',
  props: ['response', 'query'],
  mixins: [features],
  components: { SearchResultsHeader, SearchResultsLink, ResetFiltersButton },
  computed: {
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
    hasFacets () {
      return this.$store.getters['search/activeFacets'].length > 0
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

    &__items {

      &__item {
        max-width: 100%;
        overflow: hidden;
        position: relative;

        &__download,
        &__star {
          z-index: 100;
          position: absolute;
          top: 0;
          right: 0;
          visibility: hidden;
          box-shadow:0 0 $spacer $spacer mix($secondary, white, 5%);

          &:hover {
            box-shadow:0 0 $spacer $spacer white;
          }
        }

        &__star {
          right: 50px;
        }

        &__link {
          padding-right: 7rem;
        }

        &:hover &__download,
        &:hover &__star {
          visibility: visible;
        }
      }
    }
  }
</style>
