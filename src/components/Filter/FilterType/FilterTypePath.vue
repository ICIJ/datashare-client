<script setup>
import { computed, useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import { useSearchFilter } from '@/composables/search-filter'
import { useCore } from '@/composables/core'
import FilterType from '@/components/Filter/FilterType/FilterType'
import PathTree from '@/components/PathTree/PathTree'

const { core } = useCore()
const { state, getters } = useStore()
const {
  computedFilterValues,
  whenFilterContextualized,
  watchFilterContextualized,
  watchFilterExcluded,
  watchProjects,
  watchValues
} = useSearchFilter()

const props = defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const tree = useTemplateRef('tree')

const path = computed(() => core.config.get('dataDir'))
const projects = computed(() => state.search.indices)
const selected = computedFilterValues(props.filter)

const preBodyBuild = whenFilterContextualized(props.filter, (body) => {
  // Add every filter to the search body
  getters['search/instantiatedFilters'].forEach((filter) => filter.addFilter(body))
  // Add query to the search body
  core.api.elasticsearch.addQueryToFilter(state.search.query || '*', body)
  return body
})

const reloadData = () => tree.value.reloadData()

watchFilterContextualized(props.filter, reloadData)
// When the filter is excluded/included and it's contextualized then reload the data with a spinner
watchFilterExcluded(props.filter, whenFilterContextualized(props.filter, reloadData))
// When filter values change and the filter is contextualized then reload the data
watchValues(whenFilterContextualized(props.filter, reloadData))
// When project changes, we reset the filter to avoid filtering by unknown paths
watchProjects(() => (selected.value = []))
</script>

<template>
  <filter-type :filter="filter" flush>
    <path-tree
      ref="tree"
      v-model:selected-paths="selected"
      :path="path"
      :projects="projects"
      :pre-body-build="preBodyBuild"
      :sort-by="filter.sortBy"
      :order-by="filter.orderBy"
      elasticsearch-only
      compact
      select-mode
      multiple
      no-label
    />
  </filter-type>
</template>

<!-- <template>
  <filter-boilerplate v-bind="$props" ref="filter" @aggregate="reloadPathTree">
    <template #items="{ sortBy, orderBy, query }">
      <div class="filter__tree-view">
        <path-tree
          ref="pathTree"
          v-model:selected-paths="selectedPaths"
          :path="path"
          :query="query"
          :projects="projects"
          :pre-body-build="preBodyBuild"
          :sort-by="sortBy"
          :sort-by-order="orderBy"
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
import FilterAbstract from '@/components/Filter/FilterType/FilterType'
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
</style> -->
