<script>
import each from 'lodash/each'
import filter from 'lodash/filter'
import last from 'lodash/last'
import trim from 'lodash/trim'
import { join } from 'path'

import settings from '@/utils/settings'
import Facet from '@/components/Facet'
import Tree from '@/components/Tree'
import { mixin } from '@/mixins/facets'

export default {
  name: 'FacetPath',
  mixins: [mixin],
  components: {
    Facet,
    Tree
  },
  methods: {
    tree (items) {
      const folderSeparator = '/'
      const tree = []
      let treePointer = null

      each(items, item => {
        // Remove the document base from the path
        const fullPath = item.key.split(this.treeRoot).pop()
        const lastItem = last(fullPath.split(folderSeparator))
        // Build the path for the current item starting
        // with the folter separator
        let path = folderSeparator
        treePointer = tree
        // Potentially the first node is a path begining with / so we trim
        // the string to avoid addig emtpy dir
        each(trim(fullPath, folderSeparator).split(folderSeparator), label => {
          let node = null
          if (label === lastItem) {
            path = join(path, label)
            node = { label, path, count: 0 }
          } else {
            path = join(path, label, folderSeparator)
            node = { label, path: path, count: 0, children: [] }
          }
          // Add node to tree if not already in it
          if (filter(treePointer, { label }).length === 0) {
            treePointer.push(node)
          }
          // Increment count
          filter(treePointer, { label })[0].count++
          treePointer = filter(treePointer, { label })[0].children
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
      <tree :tree-data="tree(items)" :facet="facet"></tree>
    </template>
  </facet>
</template>
