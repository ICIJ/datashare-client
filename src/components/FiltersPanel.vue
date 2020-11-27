<template>
  <div class="filters-panel" v-show="showFilters">
    <div class="filters-panel__sticky w-100">
      <hook name="filters-panel:before" />
      <div class="filters-panel__sticky__toolbar">
        <hook name="filters-panel.toolbar:before" />
        <div class="d-flex align-items-center">
          <h5 class="flex-grow-1 my-0 h6 text-uppercase text-muted">
            {{ $t('search.filtersTitle') }}
          </h5>
          <button class="filters-panel__sticky__toolbar__toggler btn btn-link" @click="hideFilters" :title="$t('search.hideFilters')" v-b-tooltip>
            <fa icon="arrow-left" class="text-light" />
            <span class="sr-only">
              {{ $t('search.hideFilters') }}
            </span>
          </button>
        </div>
        <ul class="nav flex-column">
          <li class="nav-item pt-1">
            <b-form-checkbox class="filters-panel__sticky__toolbar__item" switch id="input-contextualize-filters" v-model="contextualizeModel">
              {{ $t('search.contextualizeFiltersLabel') }}
            </b-form-checkbox>
            <b-tooltip placement="bottom" target="input-contextualize-filters" :title="$t('search.contextualizeFiltersDescription')" />
          </li>
        </ul>
        <hook name="filters-panel.toolbar:after" />
      </div>
      <hook name="filters-panel.filters:before" />
      <filter-project />
      <component v-for="filter in filters" :ref="filter.name" :key="filter.name" :is="filter.component" v-bind="{ filter }"></component>
      <hook name="filters-panel.filters:after" />
      <hook name="filters-panel:after" />
    </div>
    <b-modal hide-footer lazy ref="openFilterSearch" :title="expandedFilter ? $t('filter.' + expandedFilter.name) : null">
      <filter-search v-if="expandedFilter" :filter="expandedFilter" :model-query="query" />
    </b-modal>
  </div>
</template>

<script>
import get from 'lodash/get'
import isArray from 'lodash/isArray'
import { mapState } from 'vuex'

import FilterDate from '@/components/filter/types/FilterDate'
import FilterDateRange from '@/components/filter/types/FilterDateRange'
import FilterNamedEntity from '@/components/filter/types/FilterNamedEntity'
import FilterPath from '@/components/filter/types/FilterPath'
import FilterProject from '@/components/filter/types/FilterProject'
import FilterRecommendedBy from '@/components/filter/types/FilterRecommendedBy'
import FilterSearch from '@/components/filter/FilterSearch'
import FilterText from '@/components/filter/types/FilterText'
import FilterYesNo from '@/components/filter/types/FilterYesNo'
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
    FilterYesNo,
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
    },
    contextualizeModel: {
      set (toggle) {
        this.$root.$emit('bv::hide::tooltip')
        this.$store.commit('search/setGlobalSearch', !toggle)
      },
      get () {
        return !this.$store.state.search.globalSearch
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
          filter.resetFilterValues(refresh)
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

<style lang="scss">
  .filters-panel {
    $card-bg: darken($app-context-sidebar-bg, 5%);
    $panel-color: $app-sidebar-color;

    background: $app-context-sidebar-bg;
    color: $panel-color;
    display: flex;
    align-items: flex-start;
    padding-bottom: $spacer;
    padding-right: $spacer;
    min-height: 100vh;

    &__sticky {
      width: 100%;

      &__toolbar {
        font-size: $font-size-sm;
        line-height: $line-height-base * (1 - (85 - 95) / 95);
        padding: $spacer 0 0 $spacer;

        .custom-control-input:checked ~ .custom-control-label::before {
          background-color: $tertiary;
          border-color: $tertiary;
        }
      }

      & > .card {
        margin: $spacer 0 0 $spacer;
        border-width: 0;
        background: $card-bg;
        color: $panel-color;

        .card-header {
          position: relative;
          z-index: 10;
          border-width: 0;
          background: inherit;
          border-radius: $card-border-radius;
          color: rgba($panel-color, 0.6);

          & > h6 {
            font-weight: bolder;
            margin-bottom: 0;
            padding-top: $spacer * .25;
            background: transparent;
            cursor: pointer;
            font-size: 0.9rem;
            color: rgba($panel-color, 0.6);
          }
        }

        & > .list-group,
        & > .card-body {
          font-size: 0.8rem;
          color: $panel-color;
          padding:0;
        }
      }
    }
  }
</style>
