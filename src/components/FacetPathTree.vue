<template>
  <div class="facet-path-tree">
    <ul class="facet-path-tree__list list-unstyled mb-0 py-2 px-3" v-if="treeData.length">
      <facet-path-tree-node v-for="node in treeData" :facet="facet" :node="node" :key="node.key"></facet-path-tree-node>
    </ul>
  </div>
</template>

<script>
import FacetPathTreeNode from '@/components/FacetPathTreeNode'

export default {
  name: 'FacetPathTree',
  props: {
    treeData: Array,
    facet: Object
  },
  components: {
    FacetPathTreeNode
  }
}
</script>
