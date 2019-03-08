<template>
  <facet v-bind="propsWithout('hide-show-more')" hide-show-more ref="facet">
    <template slot="items" slot-scope="{ items }">
      <facet-path-tree :tree-data="displayFirstLevel(items)" :facet="facet"></facet-path-tree>
    </template>
  </facet>
</template>

<script>
import Facet from '@/components/Facet'
import FacetPathTree from '@/components/FacetPathTree'
import facets from '@/mixins/facets'
import reduce from 'lodash/reduce'
import replace from 'lodash/replace'

export default {
  name: 'FacetPath',
  mixins: [facets],
  components: {
    Facet,
    FacetPathTree
  },
  methods: {
    displayFirstLevel (items) {
      return reduce(items, (tree, item) => {
        tree.push({
          label: replace(item.key, this.$config.get('dataDir') + '/', ''),
          path: item.key,
          count: item.doc_count,
          children: [],
          isLoaded: false
        })
        return tree
      }, [])
    }
  }
}
</script>
