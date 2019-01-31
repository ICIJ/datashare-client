<template>
  <facet v-bind="$props" ref="facet"></facet>
</template>

<script>
import facets from '@/mixins/facets'
import Facet from '@/components/Facet'

export default {
  name: 'FacetDate',
  components: { Facet },
  mixins: [facets]
}
</script>
