<template>
  <div class="aggregations-panel">
    <component class="mb-4" v-for="facet in facets" :key="facet.name" :is="facet.type" v-bind="{ facet }"></component>
  </div>
</template>

<script>
import FacetNamedEntity from '@/components/FacetNamedEntity'
import FacetText from '@/components/FacetText'

import { mapState } from 'vuex'

export default {
  name: 'AggregationsPanel',
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

      .card-header h6 {
        font-weight: bolder;
        margin-bottom: 0;
        padding-top: $spacer * .25;
      }

      & > .list-group, & > .card-body {
        font-size: 0.9em;
        color: $body-color;
        background: white;
        max-height: 15rem;
        overflow: auto;
      }
    }
  }
</style>
