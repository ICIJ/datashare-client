<template>
  <div class="filter-search">
    <div class="card">
      <component class="border-0"
                 ref="filterComponent"
                 :is="filter.component"
                 :key="filter.name"
                 :collapsed-if-no-values="false"
                 :dark="false"
                 :model-query="modelQuery"
                 @add-filter-values="onAddedFilterValues"
                 hide-header
                 hide-show-more
                 v-bind="{ filter }"></component>
    </div>
  </div>
</template>

<script>
import FilterDate from '@/components/FilterDate'
import FilterDateRange from '@/components/FilterDateRange'
import FilterNamedEntity from '@/components/FilterNamedEntity'
import FilterPath from '@/components/FilterPath'
import FilterRecommendedBy from '@/components/FilterRecommendedBy'
import FilterText from '@/components/FilterText'
import FilterYesNo from '@/components/FilterYesNo'

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
    FilterYesNo
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
    onAddedFilterValues (component) {
      /**
       * A value is selected for a specific component
       */
      this.$root.$emit('filter::search::add-filter-values', { filter: this.filter, component })
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
