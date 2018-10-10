<template>
  <li v-if="node" :class="{ 'tree-node--has-children': hasChildren(), 'tree-node--active': hasValue(nodeParams) }" class="tree-node">
    <div class="row no-gutters">
      <div class="col tree-node__label pb-1">
        <a @click="getChildren" :title="node.label" v-b-tooltip.hover>
          <font-awesome-icon icon="folder" class="mr-1 tree-node__label__icon" />
          {{ node.label }}
        </a>
      </div>
      <div class="col tree-node__count">
        <a
          href
          @click.prevent="toggleValue(nodeParams)"
          v-b-tooltip.hover
          title="Search within this directory"
          class="badge badge-pill badge-light">
          <font-awesome-icon icon="search" class="tree-node__count__icon" />
          <span>
            {{ node.count || 0 }}
          </span>
        </a>
      </div>
    </div>
    <ul v-show="node.children && open" class="list-unstyled pl-3">
      <facet-path-tree-node v-for="child in node.children" :facet="facet" :node="child" :key="child.label"></facet-path-tree-node>
    </ul>
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
      queue: new PQueue({concurrency: 1})
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
    }
  },
  methods: {
    hasChildren () {
      return this.node.children && this.node.children.length
    },
    getChildren () {
      if (this.facet && !this.node.isLoaded) {
        return this.queue.add(() => {
          return esClient.search({ index: process.env.VUE_APP_ES_INDEX, body: this.body }).then(async r => {
            this.node.isLoaded = true
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

    &--has-children > * > &__label {
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
      color:  theme-color('primary');
    }

    .facet--reversed &--active > * > &__label {
      color: $body-color;
      text-decoration: line-through;
    }

    .facet--reversed &--active > * > &__label &__label__icon {
      color: $text-muted;
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
