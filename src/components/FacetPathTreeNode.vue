<template>
  <li v-if="node" :class="{ 'tree-node--has-children': hasChildren(), 'tree-node--active': hasValue(nodeParams) }" class="tree-node">
    <div class="d-flex flex-row">
      <div class="tree-node__label" :class="{ 'pb-1': !hasNoChildren() }">
        <a @click="toggleNode" :title="node.label" v-b-tooltip.hover>
          <fa :icon="icon" fixed-width class="mr-1 tree-node__label__icon" :spin="loading" />
          {{ node.label }}
        </a>
      </div>
      <div class="tree-node__count">
        <a
          href
          @click.prevent="toggleValue(nodeParams)"
          v-b-tooltip.hover
          :title="$t('document.search_directory')"
          class="badge badge-pill badge-light">
          <fa icon="search" class="tree-node__count__icon" />
          <span>
            {{ $n(node.count || 0 ) }}
          </span>
        </a>
      </div>
    </div>
    <ul v-show="hasChildren() && open" class="list-unstyled pl-3">
      <facet-path-tree-node v-for="(child, i) in node.children" :facet="facet" :node="child" :key="i" ref="treeNodes"></facet-path-tree-node>
    </ul>
    <div v-show="hasNoChildren() && open" class="text-muted pl-3">
      └ <span class="small">{{ $t('facet.noSubdirectories') }}</span>
    </div>
  </li>
</template>

<script>
import PQueue from 'p-queue'
import get from 'lodash/get'
import replace from 'lodash/replace'
import repeat from 'lodash/repeat'
import bodybuilder from 'bodybuilder'

import facets from '@/mixins/facets'
import esClient from '@/api/esClient'

export default {
  name: 'FacetPathTreeNode',
  props: ['node', 'facet'],
  mixins: [facets],
  data: function () {
    return {
      loading: false,
      isLoaded: false,
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
      return { key: this.node.path }
    },
    body () {
      const body = this.facet.body(bodybuilder().size(0), {
        size: 1000,
        exclude: repeat('/.*', this.node.path.split('/').length + 1),
        include: `${this.node.path}/.*`
      })
      return body.build()
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
        const index = this.$store.state.search.index
        this.loading = true
        return esClient.search({ index, body: this.body }).then(async r => {
          this.loading = false
          this.isLoaded = true
          this.node.children = []
          get(r, `aggregations.${this.facet.key}.buckets`, []).forEach(bucket => {
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
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    &--active > * > &__label &__label__icon {
      color: theme-color('secondary');
    }

    .facet--reversed &--active > * > &__label {
      color: $body-color;
      text-decoration: line-through;
    }

    .facet--reversed &--active > * > &__label &__label__icon {
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
