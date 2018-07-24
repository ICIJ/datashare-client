<template>
  <li v-if="node" :class="{ 'tree-node--folder': isFolder, 'tree-node--file': !isFolder }" class="tree-node">
    <div class="row no-gutters">
      <div class="col tree-node__label">
        <a @click="toggle">
          <font-awesome-icon :icon="nodeIcon" class="mr-1 text-muted tree-node__label__icon" />
          {{ node.label }}
        </a>
      </div>
      <div class="col tree-node__count">
        <router-link :to="{ name: 'search', query: folderParams }"
          title="Search within this directory"
          class="badge badge-pill badge-light">
          <font-awesome-icon icon="search" class="tree-node__count__icon" />
          <span class="" v-if="isFolder">
            {{ node.count || 0 }}
          </span>
        </router-link>
      </div>
    </div>
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
    overflow: hidden;

    &--folder > * > &__label {
      cursor: pointer;
    }

    &__label {
      display: block;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    &__count {
      max-width: 3rem;
      text-align: right;

      &__icon {
        color: theme-color('primary');
      }
    }
  }
</style>
