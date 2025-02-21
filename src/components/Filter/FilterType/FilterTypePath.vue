<script setup>
import { computed, useTemplateRef, toRef, watch } from 'vue'

import { useSearchFilter } from '@/composables/search-filter'
import { useCore } from '@/composables/core'
import FilterType from '@/components/Filter/FilterType/FilterType'
import PathTree from '@/components/PathTree/PathTree'
import { useSearchStore } from '@/store/modules'

const { core } = useCore()
const searchStore = useSearchStore()
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
const path = core.getDefaultDataDir()
const projects = computed(() => props.projects ?? searchStore.indices)
const selected = computedFilterValues(props.filter)

const preBodyBuild = whenFilterContextualized(props.filter, (body) => {
  // Add every filter to the search body
  searchStore.instantiatedFilters.forEach((filter) => filter.addFilter(body))
  // Add query to the search body
  core.api.elasticsearch.addQueryToFilter(searchStore.q || '*', body)
  return body
})

const reloadData = () => tree.value.reloadData()
const reset = () => (selected.value = [])

watchFilterContextualized(props.filter, reloadData)
// When the filter is excluded/included and it's contextualized then reload the data with a spinner
watchFilterExcluded(props.filter, whenFilterContextualized(props.filter, reloadData))
// When filter values change and the filter is contextualized then reload the data
watchValues(whenFilterContextualized(props.filter, reloadData))
// When project changes, we reset the filter to avoid filtering by unknown paths
watchIndices(reset)
watch(toRef(props, 'projects'), reset, { deep: true })
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
