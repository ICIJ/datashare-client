<template>
  <div class="aggregations-panel">
    <component v-for="facet in facets" :key="facet.name" :is="facet.type" v-bind="{ facet }"></component>
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
