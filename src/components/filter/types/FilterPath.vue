<template>
  <filter-boilerplate v-bind="$props" ref="filter" @aggregate="$refs.treeView.reloadDataWithSpinner()">
    <template #items="{ sortBy, sortByOrder }">
      <div class="filter__tree-view">
        <tree-view v-model="path" ref="treeView"
                  :project="project"
                  :selectedPaths.sync="selectedPaths"
                  :pre-body-build="preBodyBuild"
                  :sort-by="sortBy"
                  :sort-by-order="sortByOrder"
                  selectable
                  count
                  include-children-documents
                  no-bars
                  compact></tree-view>
      </div>
    </template>
  </filter-boilerplate>
</template>

<script>
import elasticsearch from '@/api/elasticsearch'
import FilterBoilerplate from '@/components/filter/FilterBoilerplate'
import FilterAbstract from '@/components/filter/types/FilterAbstract'
import TreeView from '@/components/TreeView'

/**
 * A Filter component to list unique directory paths.
 */
export default {
  name: 'FilterPath',
  extends: FilterAbstract,
  components: {
    FilterBoilerplate,
    TreeView
  },
  data () {
    return {
      key: null,
      path: null
    }
  },
  created () {
    this.$set(this, 'path', this.dataDir)
  },
  watch: {
    project () {
      this.$set(this, 'path', this.dataDir)
      this.$set(this, 'selectedPaths', [])
    }
  },
  computed: {
    dataDir () {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    },
    selectedPaths: {
      get () {
        return this.getFilterByName(this.filter.name).values
      },
      set (key) {
        this.setFilterValue(this.filter, { key })
        this.$store.commit('search/from', 0)
        this.refreshRouteAndSearch()
      }
    },
    project () {
      return this.$store.state.search.index
    },
    instantiatedFilters () {
      return this.$store.getters['search/instantiatedFilters']
    }
  },
  methods: {
    preBodyBuild (body) {
      if (!this.$store.state.search.globalSearch) {
        // Add every filter to the search body
        this.instantiatedFilters.forEach(filter => filter.addFilter(body))
        // Add query to the search body
        elasticsearch.addQueryToFilter(this.$store.state.search.query || '*', body)
      }
      return body
    }
  }
}
</script>

<style lang="scss" scoped>
  .filter {
    &__tree-view /deep/ .tree-view {
      &__header {
        background: $light;
        border-radius: $border-radius-sm;
        color: $body-color;
        margin: 0.5rem;

        &__hits, &__size {
          display: none;
        }
      }

      .filter--dark & .list-group-item {
        border-bottom: 0;

        a {
          color: $light;
        }
      }
    }
  }
</style>
