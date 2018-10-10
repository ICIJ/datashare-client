<script>
import each from 'lodash/each'
import replace from 'lodash/replace'

import Facet from '@/components/Facet'
import FacetPathTree from '@/components/FacetPathTree'
import facets from '@/mixins/facets'

export default {
  name: 'FacetPath',
  mixins: [facets],
  components: {
    Facet,
    FacetPathTree
  },
  methods: {
    displayFirstLevel (items) {
      const folderSeparator = '/'
      const tree = []
      each(items, item => {
        tree.push({
          label: replace(item.key, folderSeparator, ''),
          path: item.key,
          count: item.doc_count,
          children: [],
          isLoaded: false
        })
      })
      return tree
    }
  }
}
</script>

<template>
  <facet v-bind="propsWithout('hide-show-more')" hide-show-more ref="facet">
    <template slot="items" slot-scope="{ items }">
      <facet-path-tree :tree-data="displayFirstLevel(items)" :facet="facet"></facet-path-tree>
    </template>
  </facet>
</template>
