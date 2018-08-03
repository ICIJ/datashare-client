<script>
import mixin from '@/mixins/facets'
import Facet from '@/components/Facet'

export default {
  name: 'FacetText',
  components: { Facet },
  mixins: [mixin]
}
</script>

<template>
  <facet :facet="facet" ref="facet"></facet>
</template>
