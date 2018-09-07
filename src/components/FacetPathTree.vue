<template>
  <div class="facet-path-tree">
    <ul class="facet-path-tree__list list-unstyled mb-0 py-2 px-3" v-if="treeData.length">
      <tree-node v-for="node in treeData" :facet="facet" :node="node" :key="node.label"></tree-node>
    </ul>
  </div>
</template>

<script>
import TreeNode from './FacetPathTreeNode'

export default {
  name: 'FacetPathTree',
  props: ['treeData', 'facet'],
  components: {
    TreeNode
  }
}
</script>
