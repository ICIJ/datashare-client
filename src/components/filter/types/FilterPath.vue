<template>
  <filter-boilerplate v-bind="$props" ref="filter">
    <template #items="{ sortBy, sortByOrder }">
      <div class="filter__tree-view">
        <tree-view v-model="path"
                  :project="project"
                  :selectedPaths.sync="selectedPaths"
                  :pre-body-build="preBodyBuild"
                  :sort-by="sortBy"
                  :sort-by-order="sortByOrder"
                  selectable
                  count
                  no-bars
                  compact />
      </div>
    </template>
  </filter-boilerplate>
</template>

<script>
import elasticsearch from '@/api/elasticsearch'
import FilterAbstract from '@/components/filter/types/FilterAbstract'
import FilterBoilerplate from '@/components/filter/FilterBoilerplate'
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
      path: null,
      key: null
    }
  },
  created () {
    this.path = this.dataDir
  },
  watch: {
    project () {
      this.path = this.dataDir
      this.selectedPaths = []
    }
  },
  computed: {
    dataDir () {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    },
    selectedPaths: {
      get () {
        return this.filterFromStore.values
      },
      set (key) {
        this.setValue({ key })
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
        border-radius: $border-radius-sm;
        background: $light;
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
