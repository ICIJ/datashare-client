<template>
  <div class="aggregations-panel">
    <div class="aggregations-panel__global-toggler px-4 pt-3 pb-0">
      <label class="custom-control custom-checkbox m-0" :class="{ 'text-muted': globalSearch }">
        <input type="checkbox" class="custom-control-input" v-model="globalSearch" />
        <span class="custom-control-label">
          {{ $t('aggregations.relative') }}
        </span>
      </label>
    </div>
    <component v-for="facet in facets" :key="facet.name" :is="facet.type" v-bind="{ facet }"></component>
  </div>
</template>

<script>
import FacetNamedEntity from '@/components/FacetNamedEntity'
import FacetText from '@/components/FacetText'

import { mapState } from 'vuex'

export default {
  name: 'AggregationsPanel',
  data () {
    return {
      globalSearch: this.$store.state.aggregation.globalSearch
    }
  },
  watch: {
    globalSearch (globalSearch) {
      this.$store.commit('aggregation/setGlobalSearch', globalSearch)
    }
  },
  components: {
    FacetNamedEntity,
    FacetText
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
      }

      .card-header h6 {
        font-weight: bolder;
        margin-bottom: 0;
        padding-top: $spacer * .25;
        text-transform: uppercase;
        color: $gray-500;
        background: transparent;
        cursor: pointer;
      }

      & > .list-group, & > .card-body {
        font-size: 0.9em;
        color: $body-color;
        padding:0;
        max-height: 20rem;
        overflow: auto;

      }
    }
  }
</style>
