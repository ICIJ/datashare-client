<template>
  <div class="filter__footer d-flex align-items-center text-nowrap px-1">
    <filter-sort-by-dropdown v-if="!hideSort"
                            :sort-by="sortBy"
                            :sort-by-order="sortByOrder"
                            :sort-by-options="sortByOptions"
                            @update:sortBy="$emit('update:sortBy', $event)"
                            @update:sortByOrder="$emit('update:sortByOrder', $event)" />
    <button v-if="shouldDisplayShowMore"
            class="filter__footer__action filter__footer__action--expand btn btn-link btn-sm"
            @click="openFilterSearch">
      <fa icon="expand-alt" fixed-width />
      {{ $t('filter.showMore') }}
    </button>
    <b-form-checkbox v-if="!hideExclude"
                     v-model="isReversed"
                     size="sm"
                     class="filter__footer__action filter__footer__action--invert ml-auto">
      {{ $t('filter.invert') }}
    </b-form-checkbox>
    <b-form-checkbox v-if="!hideContextualize"
                     v-model="isContextualized"
                     size="sm"
                     class="filter__footer__action filter__footer__action--contextualize">
      Contextualize
    </b-form-checkbox>
  </div>
</template>

<script>
import FilterSortByDropdown from '@/components/filter/FilterSortByDropdown'
import settings from '@/utils/settings'

export default {
  name: 'FilterFooter',
  components: {
    FilterSortByDropdown
  },
  props: {
    filter: {
      type: Object
    },
    hideContextualize: {
      type: Boolean,
      default: false
    },
    hideExclude: {
      type: Boolean,
      default: false
    },
    hideSort: {
      type: Boolean,
      default: false
    },
    hideShowMore: {
      type: Boolean,
      default: false
    },
    sortBy: {
      type: String,
      default: '_count'
    },
    sortByOrder: {
      type: String,
      default: 'desc'
    },
    sortByOptions: {
      type: Array,
      default: () => settings.filter.sortByOptions
    }
  },
  computed: {
    shouldDisplayShowMore () {
      return !this.hideShowMore
    },
    isReversed: {
      get () {
        return this.$store.getters['search/isFilterReversed'](this.filter.name)
      },
      set (toggler) {
        // Change the store so it's reflected everywhere
        this.toggleFilter(toggler)
        /**
         * Triggered when the filter is "inverted" (excluding selected values).
         */
        this.$emit('toggle-filter', this.filter)
      }
    },
    isContextualized: {
      get () {
        return this.$store.getters['search/isFilterContextualized'](this.filter.name)
      },
      set (toggler) {
        // Change the store so it's reflected everywhere
        this.toggleContextualizedFilter(toggler)
        /**
         * Triggered when the filter is "contextualized" (relative to the search results).
         */
        this.$emit('contextualize-filter', this.filter)
      }
    }
  },
  methods: {
    openFilterSearch () {
      /**
       * Triggered when user starts to search in the filter values.
       */
      this.$emit('open-filter-search', this.filter, this.query)
    },
    toggleContextualizedFilter (toggler) {
      if (toggler) {
        this.$store.commit('search/contextualizeFilter', this.filter.name)
      } else {
        this.$store.commit('search/decontextualizeFilter', this.filter.name)
      }
    },
    toggleFilter (toggler) {
      if (toggler) {
        this.$store.commit('search/excludeFilter', this.filter.name)
      } else {
        this.$store.commit('search/includeFilter', this.filter.name)
      }
    }
  }
}
</script>

<style lang="scss">
  .filter__footer {

    .filter--has-values & {
      background: $tertiary;
      color: #000;
    }

    &__action {
      color: inherit;

      &.btn {
        padding: 0.2em;
      }

      .filter__footer > &.custom-checkbox {
        margin: 0 .2em;

        label {
          padding-top: 0;
          display: inline-block;
          margin-bottom: 0;
        }

        .filter--has-values & .custom-control-input:checked ~ .custom-control-label::before {
          background: #000;
          border-color: #000;
          color: #fff;
        }
      }

      &:hover, &:active {
        color: inherit;
      }
    }
  }
</style>
