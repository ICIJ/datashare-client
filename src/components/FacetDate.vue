<template>
  <facet v-bind="$props" ref="facet">
    <template #all>
      <span v-html="getItemLabel({ key: 'all', key_as_string: 'all', doc_count: totalCount })"></span>
    </template>
  </facet>
</template>

<script>
import facets from '@/mixins/facets'
import Facet from '@/components/Facet'
import get from 'lodash/get'
import sumBy from 'lodash/sumBy'

export default {
  name: 'FacetDate',
  components: { Facet },
  mixins: [facets],
  data () {
    return {
      totalCount: 0
    }
  },
  mounted () {
    this.$store.dispatch('search/queryFacet', { name: this.facet.name, options: { size: 1000 } }).then(r => {
      this.totalCount = sumBy(get(r, this.resultPath, []), 'doc_count')
    })
  }
}
</script>
