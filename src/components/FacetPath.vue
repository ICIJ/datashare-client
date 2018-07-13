<script>
import each from 'lodash/each'
import filter from 'lodash/filter'
import last from 'lodash/last'
import { mixin } from 'mixins/facets'
import Tree from './Tree'

export default {
  name: 'FacetPath',
  props: ['facet'],
  mixins: [mixin],
  components: {
    Tree
  },
  created () {
    this.aggregate()
    // Watch change on the facet store the restart aggregation
    this.$store.watch(this.watchedForUpdate, this.aggregate, { deep: true })
  },
  computed: {
    items () {
      return this.response.get(`aggregations.${this.facet.key}.buckets`, [])
    },
    facetFilter () {
      return this.$store.getters['search/findFacet'](this.facet.name)
    },
    placeholderRows () {
      return [
        {
          height: '1em',
          boxes: [[0, '70%'], ['20%', '10%']]
        }
      ]
    },
    isGlobal () {
      return this.$store.state.aggregation.globalSearch
    },
    tree () {
      let tree = []
      let node = null
      let treePointer = null
      let path = null
      let folderSeparator = '/'
      let lastItem = null
      each(this.items, item => {
        treePointer = tree
        path = folderSeparator
        lastItem = last(item.key.split(folderSeparator))
        each(item.key.split(folderSeparator), element => {
          // Ignore empty node
          // Potentially the first node if path begins by a /
          if (element !== '') {
            if (element === lastItem) {
              path += element
              node = {label: element, path: path, count: 0}
            } else {
              path += element + folderSeparator
              node = {label: element, path: path + '*', count: 0, children: []}
            }
            // Add node to tree if not already in it
            if (filter(treePointer, {label: element}).length === 0) {
              treePointer.push(node)
            }
            // Increment count
            filter(treePointer, {label: element})[0].count++
            treePointer = filter(treePointer, {label: element})[0].children
          }
        })
      })
      return tree
    }
  }
}
</script>

<template>
  <div class="facet-path card" :class="{ 'facet-path--reversed': isReversed() }">
    <div class="card-header">
      <span v-if="hasValues()" class="float-right btn-group">
        <button class="btn btn-sm btn-outline-secondary py-0" @click="invert" :class="{ 'active': isReversed() }">
          <font-awesome-icon icon="eye-slash" />
          Invert
        </button>
      </span>
      <h6 @click="toggleItems">
        <font-awesome-icon :icon="headerIcon" />
        {{ $t('facet.' + facet.key) }}
      </h6>
    </div>
    <div class="list-group list-group-flush facet-path__items" v-if="!collapseItems">
      <div class="list-group facet__items__search py-2 px-3" v-if="filteredItems.length > 0">
        <input v-model="facetQuery" type="search" :placeholder="$t('search.search-in') + ' ' + $t('facet.' + facet.key) + '...'" />
        <font-awesome-icon icon="search" class="float-right" />
      </div>
      <div class="list-group-item facet-path-list-group">
        <tree :tree-data="tree"></tree>
      </div>
      <div v-if="!isReady">
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
        <content-placeholder class="list-group-item py-2 px-3" :rows="placeholderRows" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
