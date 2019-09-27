<template>
  <facet v-bind="$props" ref="facet">
    <template #all>
      <span class="d-flex">
        <span class="facet__items__item__label px-1 text-truncate w-100 d-inline-block">
          {{ labelToHuman('all') }}
        </span>
        <span class="facet__items__item__count badge badge-pill badge-light float-right mt-1">
          {{ countAll }}
        </span>
      </span>
    </template>
  </facet>
</template>

<script>
import facets from '@/mixins/facets'
import Facet from '@/components/Facet'

export default {
  name: 'FacetText',
  components: { Facet },
  mixins: [facets],
  computed: {
    countAll () {
      return this.root.asyncTotal || this.root.total
    }
  }
}
</script>
