<template>
  <div class="aggregations-panel">
    <b-modal hide-footer lazy ref="asyncFacetSearch" :title="selectedFacet ? $t('facet.' + selectedFacet.key) : null">
      <facet-search :facet="selectedFacet" :query="facetQuery" />
    </b-modal>
    <component v-for="facet in sortedFacets" :ref="facet.name" :key="facet.name" :is="facet.type" v-bind="{ facet }"></component>
  </div>
</template>

<script>
import FacetNamedEntity from '@/components/FacetNamedEntity'
import FacetText from '@/components/FacetText'
import FacetPath from '@/components/FacetPath'
import FacetSearch from '@/components/FacetSearch'

import sortBy from 'lodash/sortBy'
import map from 'lodash/map'
import get from 'lodash/get'
import bModal from 'bootstrap-vue/es/components/modal/modal'

import { mapState } from 'vuex'

export default {
  name: 'AggregationsPanel',
  components: {
    FacetNamedEntity,
    FacetText,
    FacetPath,
    FacetSearch,
    bModal
  },
  mounted () {
    this.$watch(() => map(this.$refs, (ref, key) => get(ref, '0.root.isReady', false)), (e) => {
      this.sortedFacets = sortBy(this.facets, facet => get(this, `$refs.${facet.name}.0.root.isReady`, true) ? !get(this, `$refs.${facet.name}.0.root.hasResults`, true) : false)
    })
    // Watch for $root event
    this.$root.$on('facet::async-search', this.asyncFacetSearch)
  },
  data () {
    return {
      relativeSearch: !this.$store.state.aggregation.globalSearch,
      sortedFacets: this.$store.state.aggregation.facets,
      selectedFacet: null,
      facetQuery: null
    }
  },
  computed: {
    ...mapState('aggregation', {
      facets: state => state.facets
    })
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
    }
  }
}
</script>

<style lang="scss">
  .aggregations-panel {

    & > .card {
      margin: $spacer;

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
  }
</style>
