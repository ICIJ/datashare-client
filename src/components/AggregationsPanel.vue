<template>
  <transition name="slide-left">
    <div class="aggregations-panel" v-show="showFilters">
      <div class="aggregations-panel__sticky w-100">
        <div class="aggregations-panel__sticky__toolbar border d-none">
          <ul class="nav">
            <li class="nav-item border-right">
              <button class="nav-link text-white font-weight-bold p-2 btn btn-sm" @click="hideFilters()" id="btn-hide-filters">
                <fa icon="chevron-left" class="mx-1" />
                <span class="sr-only">
                  {{ $t('search.hideFilters') }}
                </span>
              </button>
              <b-tooltip placement="bottom" target="btn-hide-filters" :title="$t('search.hideFilters')" />
            </li>
            <li class="nav-item ml-auto">
              <div class="custom-control custom-switch">
                <input type="checkbox" :checked="filtersContextualized" class="custom-control-input" id="input-contextualize-filters" @change="toggleContextualizeFilters($event.target.checked)">
                <label class="custom-control-label text-white font-weight-bold btn btn-sm pl-0 pr-2 pb-2 pt-0 mt-2" for="input-contextualize-filters" id="label-contextualize-filters">
                  {{ $t('search.contextualizeFiltersLabel') }}
                </label>
                <b-tooltip placement="bottom" target="label-contextualize-filters" :title="$t('search.contextualizeFiltersDescription')" />
              </div>
            </li>
            <li class="nav-item border-left">
              <button class="nav-link text-white font-weight-bold btn btn-sm px-2" id="btn-reset-filters" @click="resetFilters()" :disabled="!hasFilters">
                {{ $t('search.resetFiltersLabel') }}
              </button>
              <b-tooltip placement="bottom" target="btn-reset-filters" :title="$t('search.resetFiltersDescription')" />
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
  </transition>
</template>

<script>
import { mapState } from 'vuex'
import FacetText from '@/components/FacetText'
import FacetYesNo from '@/components/FacetYesNo'
import FacetDate from '@/components/FacetDate'
import FacetPath from '@/components/FacetPath'
import FacetNamedEntity from '@/components/FacetNamedEntity'
import FacetSearch from '@/components/FacetSearch'
import IndexSelector from '@/components/IndexSelector'
import bModal from 'bootstrap-vue/es/components/modal/modal'
import forEach from 'lodash/forEach'
import isArray from 'lodash/isArray'

export default {
  name: 'AggregationsPanel',
  components: {
    FacetText,
    FacetYesNo,
    FacetDate,
    FacetPath,
    FacetNamedEntity,
    FacetSearch,
    IndexSelector,
    bModal
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
      relativeSearch: !this.$store.state.search.globalSearch,
      selectedFacet: null,
      facetQuery: null
    }
  },
  computed: {
    ...mapState('search', ['facets', 'showFilters']),
    // Shortcut for the checkbox state
    filtersContextualized () {
      return !this.$store.state.search.globalSearch
    },
    hasFilters () {
      return this.$store.getters['search/activeFacets'].length > 0
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
          facet.root.resetFacetValues()
          if (facet.resetNamedEntityValues) {
            facet.resetNamedEntityValues()
          }
        }
      })
    },
    resetFilters () {
      this.$store.dispatch('search/reset', ['index', 'globalSearch', 'starredDocuments'])
      this.$root.$emit('bv::hide::popover')
      this.$root.$emit('facet::search::reset-filters')
      this.$router.push({ name: 'search', query: this.$store.getters['search/toRouteQuery'] })
    },
    hideFilters () {
      this.$store.commit('search/toggleFilters')
    },
    toggleContextualizeFilters (toggler) {
      this.$store.commit('search/setGlobalSearch', !toggler)
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
    width:100%;
    max-width: $aggregations-panel-width;
    min-height: calc(100vh -  var(--app-footer-height));

    &.slide-left-enter-active, &.slide-left-leave-active {
      transition: .3s;
    }

    &.slide-left-enter, &.slide-left-leave-to {
      margin-left: -1 * $aggregations-panel-width !important;
      opacity: 0;
    }

    &__sticky {

      &__toolbar {
        font-size: 0.85rem;
        line-height: $line-height-base * (1 - (85 - 95) / 95);
        margin: $spacer 0 0 $spacer;
        border-radius: $card-border-radius;

        .border-left, .border-right {
          border-color: rgba(white, 0.3) !important;
        }

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
