<template>
  <li v-if="node" v-bind:class="{ 'node-tree': true, 'folder': isFolder, 'file': !isFolder }">
    <font-awesome-icon :icon="nodeIcon" @click="toggle" class="fa-icon" />
    <router-link :to="{ name: 'search', query: folderParams }" class="ml-1">
      <span class="badge badge-pill badge-light float-right" v-if="isFolder">
        {{ node.count || 0 }}
      </span>
      {{ node.label }}
    </router-link>

    <ul v-if="node.children && node.children.length" v-show="open">
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
      return { q: `path:${this.node.path}` }
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
  li.node-tree {
    list-style: none;

    .fa-icon {
      color: $gray-500;
      cursor: pointer;
    }

    > a {
      display: inline;
      white-space: inherit;
    }

    ul {
      padding-left: $spacer * 1.5;
    }
  }
</style>
