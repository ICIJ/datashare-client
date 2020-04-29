<template>
  <ul class="list-inline flex-grow-1 m-0 tree-breadcrumb text-truncate">
    <li class="list-inline-item tree-breadcrumb__item tree-breadcrumb__item--root">
      <a href @click.prevent="$emit('input', dataDir)">
        <fa icon="folder" fixed-width />
      </a>
    </li>
    <li v-if="treeWithoutDataDir.length > maxDirectories" class="list-inline-item tree-breadcrumb__item tree-breadcrumb__item--abbr">
      ...
    </li>
    <li class="list-inline-item  tree-breadcrumb__item" v-for="directory in treeWithoutDataDir.slice(-maxDirectories)" :key="directory">
      <a href @click.prevent="$emit('input', directory)">
        {{ directory | basename }}
      </a>
    </li>
  </ul>
</template>

<script>
import { basename } from 'path'
import { filter, last, reduce } from 'lodash'

export default {
  name: 'TreeBreadcrumb',
  model: {
    prop: 'path',
    event: 'input'
  },
  props: {
    path: {
      type: String
    },
    maxDirectories: {
      type: Number,
      default: 5
    }
  },
  filters: {
    basename
  },
  computed: {
    tree () {
      return reduce(this.path.split('/'), (tree, d) => {
        if (d !== '') {
          tree.push([last(tree), basename(d)].join('/'))
        }
        return tree
      }, [])
    },
    treeWithoutDataDir () {
      return filter(this.tree, d => d.length > this.dataDir.length)
    },
    dataDir () {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    }
  }
}
</script>

<style lang="scss">
  .tree-breadcrumb {

    &__item.list-inline-item {
      padding: 0;
      margin-right: $spacer * 0.10;

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
