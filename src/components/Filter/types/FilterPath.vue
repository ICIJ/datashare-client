<template>
  <filter-boilerplate v-bind="$props" ref="filter" @aggregate="reloadPathTree">
    <template #items="{ sortBy, sortByOrder, query }">
      <div class="filter__tree-view">
        <path-tree
          ref="pathTree"
          v-model:selected-paths="selectedPaths"
          :path="path"
          :query="query"
          :projects="projects"
          :pre-body-build="preBodyBuild"
          :sort-by="sortBy"
          :sort-by-order="sortByOrder"
          :hide-empty="isContextualized"
          compact
          include-children-documents
          selectable
        />
      </div>
    </template>
  </filter-boilerplate>
</template>

<script>
import { isEqual } from 'lodash'

import FilterBoilerplate from '@/components/Filter/FilterBoilerplate'
import FilterAbstract from '@/components/Filter/types/FilterAbstract'
import PathTree from '@/components/PathTree/PathTree'

/**
 * A Filter component to list unique directory paths.
 */
export default {
  name: 'FilterPath',
  components: {
    FilterBoilerplate,
    PathTree
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
    reloadPathTree() {
      if (this.isContextualized) {
        return this.$refs.pathTree.reloadDataWithSpinner()
      }
      return this.$refs.pathTree.loadData()
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
