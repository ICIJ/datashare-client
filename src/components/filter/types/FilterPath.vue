<template>
  <filter-boilerplate v-bind="$props" ref="filter" @aggregate="reloadTreeView">
    <template #items="{ sortBy, sortByOrder, query }">
      <div class="filter__tree-view">
        <tree-view
          ref="treeView"
          v-model:path="path"
          v-model:selected-paths="selectedPaths"
          :query="query"
          :projects="projects"
          :pre-body-build="preBodyBuild"
          :sort-by="sortBy"
          :sort-by-order="sortByOrder"
          :transition="null"
          :hide-empty="isContextualized"
          compact
          count
          include-children-documents
          no-bars
          selectable
        />
      </div>
    </template>
  </filter-boilerplate>
</template>

<script>
import { isEqual } from 'lodash'

import FilterBoilerplate from '@/components/filter/FilterBoilerplate'
import FilterAbstract from '@/components/filter/types/FilterAbstract'
import TreeView from '@/components/TreeView'

/**
 * A Filter component to list unique directory paths.
 */
export default {
  name: 'FilterPath',
  components: {
    FilterBoilerplate,
    TreeView
  },
  extends: FilterAbstract,
  data() {
    return {
      key: null,
      path: null,
      pathQueries: {}
    }
  },
  computed: {
    dataDir() {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    },
    filterValues() {
      return this.getFilterByName(this.filter.name).values
    },
    selectedPaths: {
      get() {
        return this.filterValues
      },
      set(key) {
        if (!isEqual(key, this.filterValues)) {
          this.setFilterValue(this.filter, { key })
          this.$store.commit('search/from', 0)
          return this.refreshRouteAndSearch()
        }
      }
    },
    projects() {
      return this.$store.state.search.indices
    },
    instantiatedFilters() {
      return this.$store.getters['search/instantiatedFilters']
    },
    isContextualized() {
      return this.$store.getters['search/isFilterContextualized'](this.filter.name)
    }
  },
  watch: {
    projects(value, previousValue) {
      if (!isEqual(value, previousValue)) {
        this.path = this.dataDir
        this.setFilterValue(this.filter, { key: [] })
      }
    },
    path(path, oldPath) {
      if (oldPath) {
        this.pathQueries[oldPath] = this.root.query
      }
      this.root.query = this.pathQueries[path] || null
    }
  },
  created() {
    this.path = this.dataDir
  },
  methods: {
    preBodyBuild(body) {
      if (this.isContextualized) {
        // Add every filter to the search body
        this.instantiatedFilters.forEach((filter) => filter.addFilter(body))
        // Add query to the search body
        this.$core.api.elasticsearch.addQueryToFilter(this.$store.state.search.query || '*', body)
      }
      return body
    },
    reloadTreeView() {
      if (this.isContextualized) {
        return this.$refs.treeView.reloadDataWithSpinner()
      }
      return this.$refs.treeView.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
.filter {
  &__tree-view :deep(.tree-view) {
    a {
      color: currentColor;
    }

    .tree-view__header {
      padding: 0 0 $spacer-xs;
      margin: 0 $spacer-sm $spacer-sm;
      border-bottom: solid 1px $border-color;

      &__hits,
      &__size {
        display: none;
      }
    }
  }

  &--dark &__tree-view:deep(.tree-view) {
    .tree-view__header {
      border-color: $app-context-sidebar-bg;
    }

    .list-group-item {
      border-bottom: 0;
    }
  }
}
</style>
