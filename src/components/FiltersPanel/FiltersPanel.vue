<template>
  <div v-show="showFilters" class="filters-panel">
    <div class="filters-panel__sticky w-100">
      <hook name="filters-panel:before" />
      <div class="filters-panel__sticky__toolbar">
        <hook name="filters-panel.toolbar:before" />
        <div class="d-flex align-items-center">
          <h5 class="flex-grow-1 my-0 h6 text-uppercase">
            {{ $t('search.filtersTitle') }}
          </h5>
          <button
            v-b-tooltip
            class="filters-panel__sticky__toolbar__toggler btn btn-link"
            :title="$t('search.hideFilters')"
            @click="hideFilters"
          >
            <fa icon="arrow-left" class="text-tertiary"></fa>
            <span class="sr-only">
              {{ $t('search.hideFilters') }}
            </span>
          </button>
        </div>
        <hook name="filters-panel.toolbar:after" />
      </div>
      <hook name="filters-panel.filters:before" />
      <filter-project />
      <component
        :is="filter.component"
        v-for="filter in filters"
        :ref="filter.name"
        :key="filter.name"
        v-bind="{ filter }"
      />
      <hook name="filters-panel.filters:after" />
      <hook name="filters-panel:after" />
    </div>
    <b-modal
      ref="openFilterSearch"
      size="lg"
      hide-footer
      lazy
      body-class="pt-0"
      :title="expandedFilter ? $t('filter.' + expandedFilter.name) : null"
    >
      <filter-search v-if="expandedFilter" :filter="expandedFilter" :model-query="query" />
    </b-modal>
  </div>
</template>

<script>
import { get, isArray } from 'lodash'
import { mapState } from 'vuex'

import FilterDate from '@/components/Filter/types/FilterDate'
import FilterDateRange from '@/components/Filter/types/FilterDateRange'
import FilterNamedEntity from '@/components/Filter/types/FilterNamedEntity'
import FilterPath from '@/components/Filter/types/FilterPath'
import FilterProject from '@/components/Filter/types/FilterProject'
import FilterRecommendedBy from '@/components/Filter/types/FilterRecommendedBy'
import FilterSearch from '@/components/Filter/FilterSearch'
import FilterText from '@/components/Filter/types/FilterText'
import FilterStarred from '@/components/Filter/types/FilterStarred'
import Hook from '@/components/Hook'

/**
 * A panel displaying all registered filters.
 */
export default {
  name: 'FiltersPanel',
  components: {
    FilterDate,
    FilterDateRange,
    FilterNamedEntity,
    FilterPath,
    FilterProject,
    FilterRecommendedBy,
    FilterSearch,
    FilterText,
    FilterStarred,
    Hook
  },
  data() {
    return {
      expandedFilter: null,
      query: null
    }
  },
  computed: {
    ...mapState('search', ['showFilters']),
    filters: {
      cache: false,
      get() {
        return this.$store.getters['search/instantiatedFilters']
      }
    }
  },
  mounted() {
    this.$core.on('filter::async-search', this.openFilterSearch)
    this.$core.on('filter::add-filter-values', this.setFilterValue)
    this.$core.on('filter::search::reset-filters', this.resetFilterValues)
    this.$core.on('index::delete::all', this.refreshEachFilter)
  },
  methods: {
    openFilterSearch({ filter, query }) {
      if (this.$refs.openFilterSearch) {
        this.expandedFilter = filter
        this.query = query
        this.$refs.openFilterSearch.show()
      }
    },
    setFilterValue({ filter: { name }, values: value }) {
      this.$store.commit('search/setFilterValue', { name, value })
    },
    hideFilters() {
      this.$store.commit('search/toggleFilters')
    },
    isFilterComponent(component) {
      return isArray(component) && !!get(component, '0.root', false)
    },
    resetFilterValues({ refresh = true } = {}) {
      Object.values(this.$refs).forEach((component) => {
        if (this.isFilterComponent(component)) {
          const filter = component[0]
          filter.root.query = ''
          filter.root.resetFilterValues(refresh)
          if (filter.resetNamedEntityValues) {
            filter.resetNamedEntityValues()
          }
        }
      })
    },
    refreshEachFilter() {
      Object.values(this.$refs).forEach((component) => {
        if (this.isFilterComponent(component)) {
          component[0].root.aggregateWithLoading()
        }
      })
      this.resetFilterValues()
    }
  }
}
</script>

<style lang="scss" scoped>
.filters-panel {
  $card-bg: color.adjust($app-context-sidebar-bg, $lightness: -5%);
  $panel-color: $app-sidebar-color;

  align-items: flex-start;
  background: $app-context-sidebar-bg;
  color: $panel-color;
  display: flex;
  min-height: 100vh;
  padding-bottom: $spacer;
  padding-right: $spacer;

  &__sticky {
    width: 100%;

    &__toolbar {
      font-size: $font-size-sm;
      line-height: $line-height-base * 1 - math.div(85 - 95, 95);
      padding: $spacer 0 0 $spacer;
    }

    &:deep(.card) {
      background: $card-bg;
      border-width: 0;
      color: $panel-color;
      margin: $spacer 0 0 $spacer;

      .card-header {
        background: inherit;
        border-radius: $card-border-radius;
        border-width: 0;
        color: rgba($panel-color, 0.6);
        position: relative;
        z-index: 10;

        & > h6 {
          background: transparent;
          color: rgba($panel-color, 0.6);
          cursor: pointer;
          font-weight: bolder;
          margin-bottom: 0;
        }
      }

      & > .list-group,
      & > .card-body {
        color: $panel-color;
        padding: 0;
      }
    }
  }
}
</style>
