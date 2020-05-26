<template>
  <li
    :class="{ 'tree-node--has-children': hasChildren(), 'tree-node--active': hasValue(nodeParams) }"
    class="tree-node"
    v-if="node">
    <div class="d-flex flex-row">
      <div class="tree-node__label" :class="{ 'pb-1': !hasNoChildren() }">
        <a @click="toggleNode" :title="node.label" v-b-tooltip.hover>
          <fa :icon="icon" fixed-width class="mr-1 tree-node__label__icon" :spin="loading"></fa>
          {{ node.label }}
        </a>
      </div>
      <div class="tree-node__count">
        <a
          href
          @click.prevent="toggleValue(nodeParams)"
          v-b-tooltip.hover
          :title="$t('document.searchDirectory')"
          class="badge badge-pill badge-light">
          <fa icon="search" class="tree-node__count__icon"></fa>
          <span>
            {{ $n(node.count || 0 ) }}
          </span>
        </a>
      </div>
    </div>
    <ul v-show="hasChildren() && open" class="list-unstyled pl-3">
      <filter-path-tree-node
        :filter="filter"
        :key="index"
        :node="child"
        ref="treeNodes"
        v-for="(child, index) in node.children"></filter-path-tree-node>
    </ul>
    <div v-show="hasNoChildren() && open" class="text-muted pl-3">
      └ <span class="small">
          {{ $t('filter.noSubdirectories') }}
        </span>
    </div>
  </li>
</template>

<script>
import get from 'lodash/get'
import repeat from 'lodash/repeat'
import replace from 'lodash/replace'
import PQueue from 'p-queue'

import filters from '@/mixins/filters'

/**
 * A child of the FilterPathTree component to display a node.
 */
export default {
  name: 'FilterPathTreeNode',
  props: {
    /**
     * Node definition
     */
    node: {
      type: Object
    },
    /**
     * Filter definition
     */
    filter: {
      type: Object
    }
  },
  mixins: [filters],
  data () {
    return {
      isLoaded: false,
      loading: false,
      queue: new PQueue({ concurrency: 1 })
    }
  },
  mounted () {
    if (this.open) {
      this.getChildren()
    }
  },
  computed: {
    nodeParams () {
      return { key: this.node.path + '/' }
    },
    icon () {
      if (this.loading) {
        return 'sync'
      }
      return this.open ? 'folder-open' : 'folder'
    },
    open () {
      return this.$store.getters['treeView/isOpen'](this.node.path)
    }
  },
  methods: {
    hasChildren () {
      return this.node.children && this.node.children.length
    },
    hasNoChildren () {
      return this.isLoaded && this.node.children && !this.node.children.length
    },
    toggleNode () {
      return this.open ? this.closeNode() : this.openNode()
    },
    closeNode () {
      this.$store.commit('treeView/removePath', this.node.path)
      this.closeChildren()
    },
    openNode () {
      this.$store.commit('treeView/addPath', this.node.path)
      this.getChildren()
    },
    closeChildren () {
      return (this.$refs.treeNodes || []).forEach(vm => vm.closeNode())
    },
    getChildren () {
      return this.queue.add(() => {
        this.loading = true
        const options = {
          exclude: repeat('/.*', this.node.path.split('/').length + 1),
          include: `${this.node.path}/.*`
        }
        return this.$store.dispatch('search/queryFilter', { name: this.filter.name, options }).then(r => {
          this.loading = false
          this.isLoaded = true
          this.node.children = []
          get(r, `aggregations.${this.filter.key}.buckets`, []).forEach(bucket => {
            this.node.children.push({
              label: replace(bucket.key, this.node.path + '/', ''),
              path: bucket.key,
              count: bucket.doc_count,
              children: [],
              isLoaded: false
            })
          })
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .tree-node {
    overflow: hidden;

    &__label {
      cursor: pointer;
    }

    &__label {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
      white-space: nowrap;
    }

    &--active > * > &__label &__label__icon {
      color: theme-color('secondary');
    }

    .filter--reversed &--active > * > &__label {
      color: $body-color;
      text-decoration: line-through;
    }

    .filter--reversed &--active > * > &__label &__label__icon {
      color: $text-muted;
    }

    &__count {
      text-align: right;

      &__icon {
        color: theme-color('primary');
      }
    }
  }
</style>
