<template>
  <div class="filters-panel" v-show="showFilters">
    <div class="filters-panel__sticky w-100">
      <hook name="filters-panel:before"></hook>
      <div class="filters-panel__sticky__toolbar">
        <hook name="filters-panel.toolbar:before"></hook>
        <div class="d-flex align-items-center">
          <h5 class="flex-grow-1 my-0 h6 text-uppercase text-muted">
            {{ $t('search.filtersTitle') }}
          </h5>
          <button class="filters-panel__sticky__toolbar__toggler btn btn-link" @click="hideFilters" :title="$t('search.hideFilters')" v-b-tooltip>
            <fa icon="arrow-left" class="text-light"></fa>
            <span class="sr-only">
              {{ $t('search.hideFilters') }}
            </span>
          </button>
        </div>
        <hook name="filters-panel.toolbar:after"></hook>
      </div>
      <hook name="filters-panel.filters:before"></hook>
      <filter-project></filter-project>
      <component v-for="filter in filters" :ref="filter.name" :key="filter.name" :is="filter.component" v-bind="{ filter }"></component>
      <hook name="filters-panel.filters:after"></hook>
      <hook name="filters-panel:after"></hook>
    </div>
    <b-modal hide-footer lazy ref="openFilterSearch" :title="expandedFilter ? $t('filter.' + expandedFilter.name) : null">
      <filter-search v-if="expandedFilter" :filter="expandedFilter" :model-query="query"></filter-search>
    </b-modal>
  </div>
</template>

<script>
import { get, isArray } from 'lodash'
import { mapState } from 'vuex'

import FilterDate from '@/components/filter/types/FilterDate'
import FilterDateRange from '@/components/filter/types/FilterDateRange'
import FilterNamedEntity from '@/components/filter/types/FilterNamedEntity'
import FilterPath from '@/components/filter/types/FilterPath'
import FilterProject from '@/components/filter/types/FilterProject'
import FilterRecommendedBy from '@/components/filter/types/FilterRecommendedBy'
import FilterSearch from '@/components/filter/FilterSearch'
import FilterText from '@/components/filter/types/FilterText'
import FilterStarred from '@/components/filter/types/FilterStarred'
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
  mounted () {
    this.$root.$on('filter::async-search', this.openFilterSearch)
    this.$root.$on('filter::add-filter-values', this.setFilterValue)
    this.$root.$on('filter::search::reset-filters', this.resetFilterValues)
    this.$root.$on('index::delete::all', this.refreshEachFilter)
  },
  data () {
    return {
      expandedFilter: null,
      query: null
    }
  },
  computed: {
    ...mapState('search', ['showFilters']),
    filters: {
      cache: false,
      get () {
        return this.$store.getters['search/instantiatedFilters']
      }
    }
  },
  methods: {
    openFilterSearch (expandedFilter, query) {
      if (this.$refs.openFilterSearch) {
        this.$set(this, 'expandedFilter', expandedFilter)
        this.$set(this, 'query', query)
        this.$refs.openFilterSearch.show()
      }
    },
    setFilterValue ({ name }, value) {
      this.$store.commit('search/setFilterValue', { name, value })
    },
    hideFilters () {
      this.$store.commit('search/toggleFilters')
    },
    isFilterComponent (component) {
      return isArray(component) && !!get(component, '0.root', false)
    },
    resetFilterValues (refresh = true) {
      Object.values(this.$refs).forEach(component => {
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
    refreshEachFilter () {
      Object.values(this.$refs).forEach(component => {
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
  @use "sass:math";

  .filters-panel {
    $card-bg: darken($app-context-sidebar-bg, 5%);
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

        .custom-control-input:checked ~ .custom-control-label::before {
          background-color: $tertiary;
          border-color: $tertiary;
        }
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
            font-size: 0.9rem;
            font-weight: bolder;
            margin-bottom: 0;
            padding-top: $spacer * .25;
          }
        }

        & > .list-group,
        & > .card-body {
          color: $panel-color;
          font-size: 0.8rem;
          padding:0;
        }
      }
    }
  }
</style>
