<template>
  <div class="filter__footer d-flex">
    <filter-sort-by-dropdown v-if="!hideSort"
                            :sort-by="sortBy"
                            :sort-by-order="sortByOrder"
                            :sort-by-options="sortByOptions"
                            @update:sortBy="$emit('update:sortBy', $event)"
                            @update:sortByOrder="$emit('update:sortByOrder', $event)" />
    <button v-if="!hideExclude"
            class="filter__footer__action filter__footer__action--invert btn btn-link btn-sm ml-auto"
            :class="{ 'active': isReversed }"
            @click="toggleFilter">
      <fa :icon="isReversed ? 'eye-slash' : 'eye'" fixed-width class="mr-1" />
      {{ $t('filter.invert') }}
    </button>
    <button v-if="shouldDisplayShowMore"
            class="filter__footer__action filter__footer__action--expand btn btn-link btn-sm"
            @click="openFilterSearch">
      <fa icon="expand-alt" fixed-width class="mr-1" />
      {{ $t('filter.showMore') }}
    </button>
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
    isReversed () {
      return this.$store.getters['search/isFilterReversed'](this.filter.name)
    }
  },
  methods: {
    openFilterSearch () {
      /**
       * Triggered when user starts to search in the filter values.
       */
      this.$emit('open-filter-search', this.filter, this.query)
    },
    toggleFilter () {
      /**
       * Triggered when the filter is "inverted" (excluding selected values).
       */
      this.$emit('toggle-filter', this.filter)
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
      padding: 0.25rem 0.5rem;

      &:hover, &:active {
        color: inherit;
      }
    }
  }
</style>
