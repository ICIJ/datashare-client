<template>
  <div class="filter-path-tree">
    <ul class="filter-path-tree__list list-unstyled mb-0 py-2 px-3" v-if="treeData.length">
      <filter-path-tree-node v-for="node in treeData" :filter="filter" :node="node" :key="node.key"></filter-path-tree-node>
    </ul>
  </div>
</template>

<script>
import FilterPathTreeNode from '@/components/FilterPathTreeNode'

export default {
  name: 'FilterPathTree',
  props: {
    treeData: Array,
    filter: Object
  },
  components: {
    FilterPathTreeNode
  }
}
</script>
