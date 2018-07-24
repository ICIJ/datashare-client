<template>
  <li v-if="node" :class="{ 'tree-node--folder': isFolder, 'tree-node--file': !isFolder }" class="tree-node">
    <a @click="toggle" class="tree-node__label">
      <font-awesome-icon :icon="nodeIcon" class="mr-1 text-muted tree-node__label__icon" />
      {{ node.label }}
    </a>
    <router-link :to="{ name: 'search', query: folderParams }"
      title="Search within this directory"
      class="tree-node__count badge badge-pill badge-light float-right">
      <font-awesome-icon icon="search" class="tree-node__count__icon" />
      <span class="" v-if="isFolder">
        {{ node.count || 0 }}
      </span>
    </router-link>

    <ul v-if="node.children && node.children.length" v-show="open" class="list-unstyled pl-3">
      <node v-for="child in node.children" :node="child" :key="child.label"></node>
    </ul>
  </li>
</template>

<script>

export default {
  name: 'node',
  props: ['node'],
  data: function () {
    return {
      open: false
    }
  },
  computed: {
    folderParams () {
      return { q: `path:"${this.node.path}"` }
    },
    isFolder () {
      return this.node.children && this.node.children.length
    },
    nodeIcon () {
      return this.isFolder ? this.open ? 'folder-open' : 'folder' : 'file'
    }
  },
  methods: {
    toggle: function () {
      if (this.isFolder) {
        this.open = !this.open
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .tree-node {

    &--folder > &__label {
      cursor: pointer;
    }

    &__count {
      &__icon {
        color: theme-color('primary');
      }
    }
  }
</style>
