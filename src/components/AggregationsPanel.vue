<template>
  <div class="aggregations-panel">
    <component v-for="facet in sortedFacets" :ref="facet.name" :key="facet.name" :is="facet.type" v-bind="{ facet }"></component>
  </div>
</template>

<script>
import FacetNamedEntity from '@/components/FacetNamedEntity'
import FacetText from '@/components/FacetText'
import FacetPath from '@/components/FacetPath'

import sortBy from 'lodash/sortBy'
import map from 'lodash/map'
import get from 'lodash/get'

import { mapState } from 'vuex'

export default {
  name: 'AggregationsPanel',
  components: {
    FacetNamedEntity,
    FacetText,
    FacetPath
  },
  mounted () {
    this.$watch(() => map(this.$refs, (ref, key) => get(ref, '0.root.isReady', false)), (e) => {
      this.sortedFacets = sortBy(this.facets, (facet, index) => {
        return get(this, `$refs.${facet.name}.0.root.hasResults`, true) ? index : this.facets.length + index
      })
    })
  },
  data () {
    return {
      relativeSearch: !this.$store.state.aggregation.globalSearch,
      sortedFacets: this.$store.state.aggregation.facets
    }
  },
  computed: {
    ...mapState('aggregation', {
      facets: state => state.facets
    })
  }
}
</script>

<style lang="scss">
  .aggregations-panel {

    .card {
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
