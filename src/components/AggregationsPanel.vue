<template>
  <div class="aggregations-panel" v-show="showFilters">
    <div class="aggregations-panel__sticky w-100">
      <div class="aggregations-panel__sticky__toolbar">
        <div class="d-flex align-items-center">
          <h4 class="flex-grow-1 m-0">
            {{ $t('search.filtersTitle') }}
          </h4>
          <button class="aggregations-panel__sticky__toolbar__toggler btn btn-link" @click="hideFilters" :title="$t('search.hideFilters')" v-b-tooltip>
            <fa icon="arrow-left" class="text-light" />
            <span class="sr-only">
              {{ $t('search.hideFilters') }}
            </span>
          </button>
        </div>
        <ul class="nav flex-column">
          <li class="nav-item pt-1">
            <b-form-checkbox class="aggregations-panel__sticky__toolbar__item" switch id="input-contextualize-filters" v-model="contextualizeModel">
              {{ $t('search.contextualizeFiltersLabel') }}
            </b-form-checkbox>
            <b-tooltip placement="bottom" target="input-contextualize-filters" :title="$t('search.contextualizeFiltersDescription')" />
          </li>
        </ul>
      </div>
      <index-selector />
      <component v-for="facet in facets" :ref="facet.name" :key="facet.name" :is="facet.component" v-bind="{ facet }"></component>
    </div>
    <b-modal hide-footer lazy ref="asyncFacetSearch" :title="selectedFacet ? $t('facet.' + selectedFacet.name) : null">
      <facet-search :facet="selectedFacet" :query="facetQuery" />
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import FacetText from '@/components/FacetText'
import FacetYesNo from '@/components/FacetYesNo'
import FacetDate from '@/components/FacetDate'
import FacetDateRange from '@/components/FacetDateRange'
import FacetPath from '@/components/FacetPath'
import FacetNamedEntity from '@/components/FacetNamedEntity'
import FacetSearch from '@/components/FacetSearch'
import IndexSelector from '@/components/IndexSelector'
import forEach from 'lodash/forEach'
import isArray from 'lodash/isArray'

export default {
  name: 'AggregationsPanel',
  components: {
    FacetText,
    FacetYesNo,
    FacetDate,
    FacetDateRange,
    FacetPath,
    FacetNamedEntity,
    FacetSearch,
    IndexSelector
  },
  mounted () {
    this.$root.$on('facet::async-search', this.asyncFacetSearch)
    this.$root.$on('facet::add-facet-values', this.addFacetValues)
    this.$root.$on('facet::search::reset-filters', this.resetFacetValues)
    this.$root.$on('index::delete::all', this.refreshEachFacet)
    this.$root.$on('facet::search::add-facet-values', this.updateFacetSelectedValues)
  },
  data () {
    return {
      selectedFacet: null,
      facetQuery: null
    }
  },
  computed: {
    ...mapState('search', ['facets', 'showFilters']),
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
    asyncFacetSearch (selectedFacet, facetQuery) {
      if (this.$refs.asyncFacetSearch) {
        this.$set(this, 'selectedFacet', selectedFacet)
        this.$set(this, 'facetQuery', facetQuery)
        this.$refs.asyncFacetSearch.show()
      }
    },
    addFacetValues (selectedFacet, values) {
      this.$store.commit('search/addFacetValues', { facet: selectedFacet, values })
    },
    updateFacetSelectedValues (component) {
      const facet = this.$refs[component.name][0]
      if (facet) {
        facet.root.selectedValuesFromStore()
        facet.selectedValuesFromStore()
      }
    },
    resetFacetValues () {
      forEach(this.$refs, component => {
        if (isArray(component) && component[0] && component[0].root) {
          const facet = component[0]
          facet.root.facetQuery = ''
          facet.root.resetFacetValues()
          if (facet.resetNamedEntityValues) {
            facet.resetNamedEntityValues()
          }
        }
      })
    },
    hideFilters () {
      this.$store.commit('search/toggleFilters')
    },
    refreshEachFacet () {
      forEach(this.$refs, component => {
        if (isArray(component) && component[0] && component[0].root) {
          component[0].root.aggregateWithLoading()
        }
      })
      this.resetFacetValues()
    }
  }
}
</script>

<style lang="scss">
  .aggregations-panel {
    $card-bg: darken($aggregations-panel-bg, 5%);
    $panel-color: white;

    background: $aggregations-panel-bg;
    color: $panel-color;
    display: flex;
    align-items: flex-start;
    padding-bottom: $spacer;
    padding-right: $spacer;
    min-height: 100vh;

    &__sticky {
      width: 100%;

      &__toolbar {
        font-size: 0.85rem;
        line-height: $line-height-base * (1 - (85 - 95) / 95);
        margin: $spacer 0 0 $spacer;

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

          & > h6 {
            font-weight: bolder;
            margin-bottom: 0;
            padding-top: $spacer * .25;
            background: transparent;
            cursor: pointer;
            font-size: 0.9rem;
            color: rgba(white, 0.6);
          }
        }

        & > .list-group,
        & > .card-body {
          font-size: 0.8rem;
          color: inherit;
          padding:0;
        }

        .list-group-item {
          background: $card-bg;
        }

        & > .list-group {

          .facet__items {

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
