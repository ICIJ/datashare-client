<template>
  <ul class="list-inline flex-grow-1 m-0 tree-breadcrumb text-truncate">
    <li class="list-inline-item tree-breadcrumb__item tree-breadcrumb__item--root">
      <a href @click.prevent="$emit('input', dataDir)">
        <fa :icon="datadirIcon" fixed-width></fa>
      </a>
    </li>
    <li v-if="treeWithoutDataDir.length > maxDirectories" class="list-inline-item tree-breadcrumb__item tree-breadcrumb__item--abbr">
      ...
    </li>
    <li class="list-inline-item tree-breadcrumb__item" v-for="directory in tree.slice(-maxDirectories)" :key="directory">
      <a href @click.prevent="$emit('input', directory)">{{ directory | basename }}</a>
    </li>
  </ul>
</template>

<script>
import { filter, last, reduce } from 'lodash'
import { basename } from 'path'

/**
 * A clickable path breadcrumb.
 */
export default {
  name: 'TreeBreadcrumb',
  model: {
    prop: 'path',
    event: 'input'
  },
  props: {
    /**
     * Path to use in the breadcrumb.
     * @model
     */
    path: {
      type: String
    },
    /**
     * Maximum number of directories to display (truncate from the beginning using ellipsis)
     */
    maxDirectories: {
      type: Number,
      default: 5
    },
    /**
     * Hide Datashare's root data directory from the breadcrumb.
     */
    noDatadir: {
      type: Boolean
    },
    /**
     * Data directory icon
     */
    datadirIcon: {
      type: [String, Object, Array],
      default: 'folder'
    }
  },
  filters: {
    basename
  },
  computed: {
    fullTree () {
      return reduce(this.path.split('/'), (tree, d) => {
        if (d !== '') {
          tree.push([last(tree), basename(d)].join('/'))
        }
        return tree
      }, [])
    },
    treeWithoutDataDir () {
      return filter(this.fullTree, d => d.length > this.dataDir.length)
    },
    tree () {
      return this.noDatadir ? this.treeWithoutDataDir : this.fullTree
    },
    dataDir () {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    }
  }
}
</script>

<style lang="scss" scoped>
  .tree-breadcrumb {
    &__item.list-inline-item {
      margin-right: $spacer * 0.10;
      padding: 0;

      &:not(:last-child):after {
        content: "/";
        color: $text-muted;
        margin-left: $spacer * 0.10;
      }

      &:last-child a {
        color: $body-color;
        font-weight: bold;
      }
    }
  }
</style>
