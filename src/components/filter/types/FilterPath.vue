<template>
  <filter-boilerplate v-bind="$props" ref="filter" @aggregate="$refs.treeView.reloadDataWithSpinner()">
    <template #items="{ sortBy, sortByOrder }">
      <div class="filter__tree-view">
        <tree-view
                  :projects="projects"
                  :selectedPaths.sync="selectedPaths"
                  :pre-body-build="preBodyBuild"
                  :sort-by="sortBy"
                  :sort-by-order="sortByOrder"
                  compact
                  count
                  include-children-documents
                  no-bars
                  ref="treeView"
                  selectable
                  v-model="path" />
      </div>
    </template>
  </filter-boilerplate>
</template>

<script>
import { isEqual } from 'lodash'
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
    projects (value, previousValue) {
      if (!isEqual(value, previousValue)) {
        this.$set(this, 'path', this.dataDir)
        this.setFilterValue(this.filter, { key: [] })
      }
    }
  },
  computed: {
    dataDir () {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    },
    filterValues () {
      return this.getFilterByName(this.filter.name).values
    },
    selectedPaths: {
      get () {
        return this.filterValues
      },
      set (key) {
        if (!isEqual(key, this.filterValues)) {
          this.setFilterValue(this.filter, { key })
          this.$store.commit('search/from', 0)
          this.refreshRouteAndSearch()
        }
      }
    },
    projects () {
      return this.$store.state.search.indices
    },
    instantiatedFilters () {
      return this.$store.getters['search/instantiatedFilters']
    },
    isContextualized () {
      return this.$store.getters['search/isFilterContextualized'](this.filter.name)
    }
  },
  methods: {
    preBodyBuild (body) {
      if (this.isContextualized) {
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
    &__tree-view ::v-deep .tree-view {
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
