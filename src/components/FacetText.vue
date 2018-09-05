<script>
import facets from '@/mixins/facets'
import Facet from '@/components/Facet'

export default {
  name: 'FacetText',
  components: { Facet },
  mixins: [facets]
}
</script>

<template>
  <facet v-bind="$props" ref="facet"></facet>
</template>
