<template>
  <li v-if="node" :class="{ 'tree-node--folder': isFolder, 'tree-node--file': !isFolder, 'tree-node--active': hasValue(nodeParams) }" class="tree-node">
    <div class="row no-gutters">
      <div class="col tree-node__label pb-1">
        <a @click="toggle" :title="node.label" v-b-tooltip.hover>
          <font-awesome-icon :icon="nodeIcon" class="mr-1 tree-node__label__icon" />
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
          <span class="" v-if="isFolder">
            {{ node.count || 0 }}
          </span>
        </a>
      </div>
    </div>
    <ul v-if="node.children && node.children.length" v-show="open" class="list-unstyled pl-3">
      <node v-for="child in node.children" :facet="facet" :node="child" :key="child.label"></node>
    </ul>
  </li>
</template>

<script>
import settings from '@/utils/settings'
import facets from '@/mixins/facets'
import { join } from 'path'

export default {
  name: 'node',
  props: ['node', 'facet'],
  mixins: [facets],
  data: function () {
    return {
      open: false
    }
  },
  computed: {
    nodeParams () {
      return { key: join(settings.document.base, this.node.path) }
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
