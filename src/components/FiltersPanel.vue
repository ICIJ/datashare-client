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
    <b-modal hide-footer lazy ref="asyncFilterSearch" :title="selectedFilter ? $t('filter.' + selectedFilter.name) : null">
      <filter-search :filter="selectedFilter" :query="filterQuery" />
    </b-modal>
  </div>
</template>

<script>
import forEach from 'lodash/forEach'
import isArray from 'lodash/isArray'
import { mapState } from 'vuex'

import Hook from '@/components/Hook'
import FilterDate from '@/components/FilterDate'
import FilterDateRange from '@/components/FilterDateRange'
import FilterNamedEntity from '@/components/FilterNamedEntity'
import FilterPath from '@/components/FilterPath'
import FilterProject from '@/components/FilterProject'
import FilterReadBy from '@/components/FilterReadBy'
import FilterSearch from '@/components/FilterSearch'
import FilterText from '@/components/FilterText'
import FilterYesNo from '@/components/FilterYesNo'

export default {
  name: 'FiltersPanel',
  components: {
    FilterDate,
    FilterDateRange,
    FilterNamedEntity,
    FilterPath,
    FilterProject,
    FilterReadBy,
    FilterSearch,
    FilterText,
    FilterYesNo,
    Hook
  },
  mounted () {
    this.$root.$on('filter::async-search', this.asyncFilterSearch)
    this.$root.$on('filter::add-filter-values', this.setFilterValue)
    this.$root.$on('filter::search::reset-filters', this.resetFilterValues)
    this.$root.$on('index::delete::all', this.refreshEachFilter)
    this.$root.$on('filter::search::add-filter-values', this.updateFilterSelectedValues)
  },
  data () {
    return {
      selectedFilter: null,
      filterQuery: null
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
      set (toggler) {
        this.$root.$emit('bv::hide::tooltip')
        this.$store.commit('search/setGlobalSearch', !toggler)
      },
      get () {
        return !this.$store.state.search.globalSearch
      }
    }
  },
  methods: {
    asyncFilterSearch (selectedFilter, filterQuery) {
      if (this.$refs.asyncFilterSearch) {
        this.$set(this, 'selectedFilter', selectedFilter)
        this.$set(this, 'filterQuery', filterQuery)
        this.$refs.asyncFilterSearch.show()
      }
    },
    setFilterValue ({ name }, value) {
      this.$store.commit('search/setFilterValue', { name, value })
    },
    updateFilterSelectedValues (component) {
      const filter = this.$refs[component.name][0]
      if (filter) {
        filter.root.selectedValuesFromStore()
        filter.selectedValuesFromStore()
      }
    },
    resetFilterValues () {
      forEach(this.$refs, component => {
        if (isArray(component) && component[0] && component[0].root) {
          const filter = component[0]
          filter.root.filterQuery = ''
          filter.root.resetFilterValues()
          if (filter.resetNamedEntityValues) {
            filter.resetNamedEntityValues()
          }
        }
      })
    },
    hideFilters () {
      this.$store.commit('search/toggleFilters')
    },
    refreshEachFilter () {
      forEach(this.$refs, component => {
        if (isArray(component) && component[0] && component[0].root) {
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

        .card-header {
          position: sticky;
          top: 0;
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

        .list-group-item {
          background: $card-bg;
        }

        & > .list-group {

          .filter__items {

            &__search {
              display: flex;
              flex-direction: row;
              position: relative;
              background: darken($card-bg, 5);
              border: 0;

              > input {
                color: $panel-color;
                border: none;
                width: 90%;
                background: transparent;
              }

              > svg {
                margin: auto;
              }
            }

            &__display {
              cursor: pointer;
            }

            &__item {
              background: inherit;
            }
          }
        }
      }
    }
  }
</style>
