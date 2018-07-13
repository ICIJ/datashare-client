<template>
  <div class="facet-path-tree">
    <ul class="facet-path-tree-list">
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

<style lang="scss" scoped>
  .facet-path-tree {
    ul {
      margin: 0;
      padding: 0;
    }
  }
</style>
