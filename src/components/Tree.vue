<template>
  <div class="facet-path-tree">
    <ul class="facet-path-tree__list list-unstyled mb-0 py-2 px-3" v-if="treeData.length">
      <node-tree v-for="node in treeData" :node="node" :key="node.label"></node-tree>
    </ul>
  </div>
</template>

<script>
import NodeTree from './NodeTree'

export default {
  props: ['treeData'],
  components: {
    NodeTree
  }
}
</script>
