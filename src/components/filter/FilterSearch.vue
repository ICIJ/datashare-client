<template>
  <div class="filter-search">
    <component
      :is="filter.component"
      ref="filterComponent"
      :key="filter.name"
      class="bg-light"
      :collapsed-if-no-values="false"
      :dark="false"
      :model-query="modelQuery"
      hide-header
      hide-show-more
      sticky-search
      v-bind="{ filter }"
      @add-filter-values="onAddedFilterValues"
    />
  </div>
</template>

<script>
import FilterDate from '@/components/filter/types/FilterDate'
import FilterDateRange from '@/components/filter/types/FilterDateRange'
import FilterNamedEntity from '@/components/filter/types/FilterNamedEntity'
import FilterPath from '@/components/filter/types/FilterPath'
import FilterRecommendedBy from '@/components/filter/types/FilterRecommendedBy'
import FilterText from '@/components/filter/types/FilterText'
import FilterStarred from '@/components/filter/types/FilterStarred'

/**
 * A panel to search into a specific filter.
 */
export default {
  name: 'FilterSearch',
  components: {
    FilterDate,
    FilterDateRange,
    FilterNamedEntity,
    FilterPath,
    FilterRecommendedBy,
    FilterText,
    FilterStarred
  },
  props: {
    modelQuery: {
      type: String,
      default: ''
    },
    filter: {
      type: Object
    }
  },
  methods: {
    onAddedFilterValues(component) {
      /**
       * A value is selected for a specific component
       */
      this.$core.emit('filter::search::add-filter-values', { filter: this.filter, component })
    }
  }
}
</script>

<style lang="scss">
.filter-search {
  .filter {
    &__items {
      max-height: calc(100vh - 300px);

      &__search {
        margin-top: 0.5rem;
      }
    }
  }
}
</style>
