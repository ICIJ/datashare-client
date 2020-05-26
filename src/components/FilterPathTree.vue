<template>
  <div class="filter-path-tree">
    <ul class="filter-path-tree__list list-unstyled mb-0 py-2 px-3" v-if="treeData.length">
      <filter-path-tree-node
        :filter="filter"
        :key="node.key"
        :node="node"
        v-for="node in treeData"></filter-path-tree-node>
    </ul>
  </div>
</template>

<script>
import FilterPathTreeNode from '@/components/FilterPathTreeNode'

/**
 * A child of the FilterPath component to display a list of node of the path tree.
 */
export default {
  name: 'FilterPathTree',
  props: {
    /**
     * List of nodes
     */
    treeData: {
      type: Array
    },
    /**
     * Filter definition
     */
    filter: {
      type: Object
    }
  },
  components: {
    FilterPathTreeNode
  }
}
</script>
