<template>
  <transition name="slide-left">
    <div class="aggregations-panel" v-show="showFilters">
      <b-modal hide-footer lazy ref="asyncFacetSearch" :title="selectedFacet ? $t('facet.' + selectedFacet.name) : null">
        <facet-search :facet="selectedFacet" :query="facetQuery" />
      </b-modal>
      <div class="aggregations-panel__toolbar mx-3">
        <ul class="nav">
          <li class="nav-item">
            <a class="nav-link p-0 text-uppercase font-weight-bold" href @click.prevent="clickOnHideFilters()">
              <fa icon="filter" />
              {{ $t('search.hideFilters') }}
            </a>
          </li>
        </ul>
      </div>
      <index-selector />
      <component v-for="facet in sortedFacets" :ref="facet.name" :key="facet.name" :is="facet.component" v-bind="{ facet }"></component>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex'
import { EventBus } from '@/utils/event-bus'

import FacetDate from '@/components/FacetDate'
import FacetNamedEntity from '@/components/FacetNamedEntity'
import FacetPath from '@/components/FacetPath'
import FacetSearch from '@/components/FacetSearch'
import FacetText from '@/components/FacetText'
import IndexSelector from '@/components/IndexSelector'

import bModal from 'bootstrap-vue/es/components/modal/modal'
import forEach from 'lodash/forEach'
import get from 'lodash/get'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'

export default {
  name: 'AggregationsPanel',
  components: {
    FacetDate,
    FacetNamedEntity,
    FacetPath,
    FacetSearch,
    FacetText,
    IndexSelector,
    bModal
  },
  mounted () {
    this.$watch(() => map(this.$refs, (ref, key) => get(ref, '0.root.isReady', false)), () => {
      this.sortedFacets = sortBy(this.facets, facet => {
        const root = get(this, `$refs.${facet.name}.0.root`, {})
        if (root.isReady) {
          return root.facetQuery === '' || !root.hasResults
        } else {
          return false
        }
      })
    })
    // Watch for $root event
    this.$root.$on('facet::async-search', this.asyncFacetSearch)
    this.$root.$on('facet::add-facet-values', this.addFacetValues)
    EventBus.$on('facet::search::add-facet-values', this.updateFacetSelectedValues)
    EventBus.$on('facet::search::reset-filters', this.resetFacetValues)
  },
  data () {
    return {
      relativeSearch: !this.$store.state.search.globalSearch,
      sortedFacets: this.$store.state.search.facets,
      selectedFacet: null,
      facetQuery: null
    }
  },
  computed: {
    ...mapState('search', ['facets', 'showFilters'])
  },
  methods: {
    asyncFacetSearch (selectedFacet, facetQuery) {
      if (this.$refs.asyncFacetSearch) {
        // Set properties
        this.$set(this, 'selectedFacet', selectedFacet)
        this.$set(this, 'facetQuery', facetQuery)
        // Display the modal
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
      }
    },
    resetFacetValues () {
      forEach(this.$refs, component => {
        const facet = component[0]
        if (facet) {
          facet.root.resetFacetValues()
          if (facet.resetNamedEntityValues) {
            facet.resetNamedEntityValues()
          }
        }
      })
    },
    clickOnHideFilters () {
      this.$store.commit('search/toggleFilters')
    }
  }
}
</script>

<style lang="scss">
  .aggregations-panel {

    &.slide-left-enter-active, &.slide-left-leave-active {
      transition: .3s;
    }

    &.slide-left-enter, &.slide-left-leave-to {
      margin-left: -1 * $aggregations-panel-width !important;
      opacity: 0;
    }

    & > .card {
      margin: 0 $spacer $spacer;

      .card-header {
        background: $aggregations-panel-bg;
        position: sticky;
        top:0;
        z-index: 100;

        & > h6 {
          font-weight: bolder;
          margin-bottom: 0;
          padding-top: $spacer * .25;
          text-transform: uppercase;
          color: $gray-500;
          background: transparent;
          cursor: pointer;
        }
      }

      & > .list-group,
      & > .card-body {
        font-size: 0.9em;
        color: $body-color;
        padding:0;
      }

      & > .list-group {

        .facet__items {

          &__search {
            color: $gray-500;
            display: flex;
            flex-direction: row;
            position: relative;

            > input {
              border: none;
              width: 90%;
            }

            > svg {
              margin: auto;
            }
          }

          &__display {
            cursor: pointer;
          }
        }
      }
    }

    &__toolbar {
      font-size: 0.85rem;
      line-height: $line-height-base * (1 - (85 - 95) / 95);
      padding: 0.5rem 0;
    }
  }
</style>
