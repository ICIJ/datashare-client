<template>
  <div class="filter-search">
    <component
      :is="filter.component"
      ref="filterComponent"
      :key="filter.name"
      class="bg-tertiary"
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
import FilterDate from '@/components/Filter/types/FilterDate'
import FilterDateRange from '@/components/Filter/types/FilterDateRange'
import FilterNamedEntity from '@/components/Filter/types/FilterNamedEntity'
import FilterPath from '@/components/Filter/types/FilterPath'
import FilterRecommendedBy from '@/components/Filter/types/FilterRecommendedBy'
import FilterText from '@/components/Filter/types/FilterText'
import FilterStarred from '@/components/Filter/types/FilterStarred'

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
