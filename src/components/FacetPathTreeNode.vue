<template>
  <li v-if="node" :class="{ 'tree-node--has-children': hasChildren(), 'tree-node--active': hasValue(nodeParams) }" class="tree-node">
    <div class="d-flex flex-row">
      <div class="tree-node__label" :class="{ 'pb-1': !hasNoChildren() }">
        <a @click="getChildren" :title="node.label" v-b-tooltip.hover>
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
            {{ node.count || 0 }}
          </span>
        </a>
      </div>
    </div>
    <ul v-show="hasChildren() && open" class="list-unstyled pl-3">
      <facet-path-tree-node v-for="child in node.children" :facet="facet" :node="child" :key="child.label"></facet-path-tree-node>
    </ul>
    <div v-show="hasNoChildren() && open" class="text-muted pl-3">
      └ <span class="small">{{ $t('facet.noSubdirectories') }}</span>
    </div>
  </li>
</template>

<script>
import facets from '@/mixins/facets'
import bodybuilder from 'bodybuilder'
import esClient from '@/api/esClient'
import PQueue from 'p-queue'
import each from 'lodash/each'
import get from 'lodash/get'
import replace from 'lodash/replace'
import repeat from 'lodash/repeat'

export default {
  name: 'FacetPathTreeNode',
  props: ['node', 'facet'],
  mixins: [facets],
  data: function () {
    return {
      open: false,
      loading: false,
      isLoaded: false,
      queue: new PQueue({ concurrency: 1 })
    }
  },
  computed: {
    nodeParams () {
      return { key: this.node.path }
    },
    body () {
      let body = this.facet.body(bodybuilder().size(0), {
        size: 5,
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
    }
  },
  methods: {
    hasChildren () {
      return this.node.children && this.node.children.length
    },
    hasNoChildren () {
      return this.isLoaded && this.node.children && !this.node.children.length
    },
    getChildren () {
      if (this.facet && !this.isLoaded) {
        return this.queue.add(() => {
          const index = this.$store.state.search.index
          this.loading = true
          return esClient.search({ index, body: this.body }).then(async r => {
            this.loading = false
            this.isLoaded = true
            each(get(r, `aggregations.${this.facet.key}.buckets`, []), bucket => {
              this.node.children.push({
                label: replace(bucket.key, this.node.path + '/', ''),
                path: bucket.key,
                count: bucket.doc_count,
                children: [],
                isLoaded: false
              })
            })
            this.open = !this.open
          })
        })
      } else {
        this.open = !this.open
      }
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
