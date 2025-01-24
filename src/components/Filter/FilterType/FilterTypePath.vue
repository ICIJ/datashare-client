<script setup>
import { computed, useTemplateRef, watch } from 'vue'
import { useStore } from 'vuex'

import { useSearchFilter } from '@/composables/search-filter'
import { useCore } from '@/composables/core'
import FilterType from '@/components/Filter/FilterType/FilterType'
import PathTree from '@/components/PathTree/PathTree'
import { usePath } from '@/utils/path'

const { core } = useCore()
const { state, getters } = useStore()
const {
  computedFilterValues,
  whenFilterContextualized,
  watchFilterContextualized,
  watchFilterExcluded,
  watchIndices,
  watchValues
} = useSearchFilter()

const props = defineProps({
  projects: {
    type: Array,
    default: null
  },
  filter: {
    type: Object,
    required: true
  },
  modal: {
    type: Boolean
  }
})

const tree = useTemplateRef('tree')
const { defaultDataDir } = usePath()
const path = defaultDataDir
const projects = computed(() => props.projects ?? state.search.indices)
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
watchIndices(() => (selected.value = []))
watch(
  () => props.projects,
  (newProjectProps) => {
    if (newProjectProps) {
      selected.value = []
    }
  }
)
</script>

<template>
  <filter-type :filter="filter" :modal="modal" flush>
    <path-tree
      ref="tree"
      v-model:selected-paths="selected"
      include-children-documents
      :compact="!modal"
      :path="path"
      :projects="projects"
      :pre-body-build="preBodyBuild"
      :sort-by="filter.sortBy"
      :order-by="filter.orderBy"
      elasticsearch-only
      select-mode
      multiple
      no-label
    />
  </filter-type>
</template>
