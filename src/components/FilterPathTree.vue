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

export default {
  name: 'FilterPathTree',
  props: {
    treeData: {
      type: Array
    },
    filter: {
      type: Object
    }
  },
  components: {
    FilterPathTreeNode
  }
}
</script>
