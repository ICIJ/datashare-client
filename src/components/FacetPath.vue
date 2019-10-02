<template>
  <facet v-bind="propsWithout('hide-show-more')" hide-show-more ref="facet">
    <template #items="{ items }">
      <vue-perfect-scrollbar class="facet__path__scrollbar">
        <facet-path-tree :tree-data="displayFirstLevel(items)" :facet="facet"></facet-path-tree>
      </vue-perfect-scrollbar>
    </template>
  </facet>
</template>

<script>
import Facet from '@/components/Facet'
import FacetPathTree from '@/components/FacetPathTree'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'
import facets from '@/mixins/facets'
import map from 'lodash/map'
import replace from 'lodash/replace'

export default {
  name: 'FacetPath',
  mixins: [facets],
  components: {
    Facet,
    FacetPathTree,
    VuePerfectScrollbar
  },
  methods: {
    displayFirstLevel (items) {
      return map(items, item => {
        return {
          label: replace(item.key, this.$config.get('dataDir') + '/', ''),
          path: item.key,
          count: item.doc_count,
          children: [],
          isLoaded: false,
          // A unique key created every time the data from the server are updated
          key: [(new Date()).getTime(), item.key].join('-')
        }
      })
    }
  }
}
</script>

<style lang="scss">
  .facet__path__scrollbar {
    max-height: 250px;
  }
</style>
