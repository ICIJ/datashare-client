<template>
  <facet v-bind="$props" ref="facet">
    <template #all>
      <span class="d-flex">
        <span class="facet__items__item__label px-1 text-truncate w-100 d-inline-block">
          {{ labelToHuman('all') }}
        </span>
        <span class="facet__items__item__count badge badge-pill badge-light float-right mt-1">
          {{ $n(totalCount) }}
        </span>
      </span>
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
  components: {
    Facet
  },
  mixins: [facets],
  data () {
    return {
      totalCount: 0
    }
  },
  mounted () {
    this.$store.dispatch('search/queryFacet', { name: this.facet.name, options: { size: 1000 } }).then(response => {
      this.$set(this, 'totalCount', sumBy(get(response, this.resultPath, []), 'doc_count'))
    })
  }
}
</script>
