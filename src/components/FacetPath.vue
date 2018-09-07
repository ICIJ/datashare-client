<script>
import each from 'lodash/each'
import find from 'lodash/find'
import last from 'lodash/last'
import trim from 'lodash/trim'
import { join } from 'path'

import settings from '@/utils/settings'
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
    tree (items) {
      const folderSeparator = '/'
      const tree = []
      let treePointer = null

      each(items, item => {
        // Remove the document base from the path
        const fullPath = item.key.split(this.treeRoot).pop()
        // Build the path for the current item starting
        // with the folter separator
        let path = folderSeparator
        treePointer = tree
        // Potentially the first node is a path begining with / so we trim
        // the string to avoid addig emtpy dir
        each(trim(fullPath, folderSeparator).split(folderSeparator), label => {
          let folder = find(treePointer, { label })
          // Add node to tree if not already in it
          if (!folder) {
            treePointer.push({
              label,
              path: join(path, label, folderSeparator),
              count: item.doc_count,
              children: []
            })
            treePointer = last(treePointer).children
          } else {
            // Increment count
            folder.count += item.doc_count
            treePointer = folder.children
          }
        })
      })
      return tree
    }
  },
  computed: {
    treeRoot () {
      return settings.document.base
    }
  }
}
</script>

<template>
  <facet v-bind="propsWithout('hide-show-more')" hide-show-more ref="facet">
    <template slot="items" slot-scope="{ items }">
      <facet-path-tree :tree-data="tree(items)" :facet="facet"></facet-path-tree>
    </template>
  </facet>
</template>
