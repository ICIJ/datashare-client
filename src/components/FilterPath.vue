<template>
  <filter-boilerplate v-bind="$props" ref="filter">
    <template #items>
      <div class="filter__path__scrollbar">
        <tree-view :project="project" v-model="path" :selectedPaths.sync="selectedPaths" :pre-body-build="preBodyBuild" selectable count no-bars compact />
      </div>
    </template>
  </filter-boilerplate>
</template>

<script>
import elasticsearch from '@/api/elasticsearch'
import FilterBoilerplate from '@/components/FilterBoilerplate'
import TreeView from '@/components/TreeView'
import filters from '@/mixins/filters'

/**
 * A Filter component to list unique directory paths.
 */
export default {
  name: 'FilterPath',
  mixins: [filters],
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
    &__path__scrollbar {
      max-height: 250px;

      & /deep/ .tree-view {

        &__header {
          border-radius: $border-radius-sm;
          background: $light;
          color: $body-color;
          margin: 0.5rem;

          &__hits, &__size {
            display: none;
          }
        }

        .list-group-item {
          border-bottom: 0;

          a {
            color: $light;
          }
        }
      }
    }
  }
</style>
