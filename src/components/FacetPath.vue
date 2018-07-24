<script>
import each from 'lodash/each'
import filter from 'lodash/filter'
import last from 'lodash/last'
import trim from 'lodash/trim'
import { join } from 'path'

import { mixin } from 'mixins/facets'
import Tree from './Tree'
import settings from '@/utils/settings'

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
    treeRoot () {
      return settings.document.base
    },
    tree () {
      const folderSeparator = '/'
      const tree = []
      let treePointer = null

      each(this.items, item => {
        // Remove the document base from the path
        const fullPath = item.key.split(this.treeRoot).pop()
        const lastItem = last(fullPath.split(folderSeparator))
        // Build the path for the current item starting
        // with the folter separator
        let path = this.treeRoot
        treePointer = tree
        // Potentially the first node is a path begining with / so we trim
        // the string to avoid addig emtpy dir
        each(trim(fullPath, '/').split(folderSeparator), label => {
          let node = null
          if (label === lastItem) {
            path = join(path, label)
            node = { label, path, count: 0 }
          } else {
            path = join(path, label, folderSeparator)
            node = { label, path: path + '*', count: 0, children: [] }
          }
          // Add node to tree if not already in it
          if (filter(treePointer, { label }).length === 0) {
            treePointer.push(node)
          }
          // Increment count
          filter(treePointer, { label })[0].count++
          treePointer = filter(treePointer, { label })[0].children
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
      <div class="list-group facet__items__search py-2 px-3" v-if="hasResults && facet.isSearchable">
        <input v-model="facetQuery" type="search" :placeholder="$t('search.search-in') + ' ' + $t('facet.' + facet.key) + '...'" />
        <font-awesome-icon icon="search" class="float-right" />
      </div>
      <div class="list-group-item facet-path-list-group" v-if="isReady">
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
