<template>
  <filter-boilerplate v-bind="propsWithout('hide-show-more')" hide-show-more ref="filter">
    <template #items="{ items }">
      <vue-perfect-scrollbar class="filter__path__scrollbar">
        <filter-path-tree :tree-data="displayFirstLevel(items)" :filter="filter"></filter-path-tree>
      </vue-perfect-scrollbar>
    </template>
  </filter-boilerplate>
</template>

<script>
import map from 'lodash/map'
import replace from 'lodash/replace'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'

import FilterBoilerplate from '@/components/FilterBoilerplate'
import FilterPathTree from '@/components/FilterPathTree'
import filters from '@/mixins/filters'

export default {
  name: 'FilterPath',
  mixins: [filters],
  components: {
    FilterBoilerplate,
    FilterPathTree,
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

<style lang="scss" scoped>
  .filter__path__scrollbar {
    max-height: 250px;
  }
</style>
