<script setup>
import { computed, ref, useTemplateRef } from 'vue'

import ButtonTogglePathTreeView from '@/components/Button/ButtonTogglePathTreeView'
import FilterType from '@/components/Filter/FilterType/FilterType'
import PathTree from '@/components/PathTree/PathTree'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useCore } from '@/composables/useCore'
import { useSearchStore } from '@/store/modules'

const { core } = useCore()
const searchStore = useSearchStore.inject()
const {
  computedFilterValues,
  whenFilterContextualized,
  watchFilterContextualized,
  watchFilterExcluded,
  watchIndices,
  watchValues
} = useSearchFilter()

const props = defineProps({
  filter: {
    type: Object,
    required: true
  },
  modal: {
    type: Boolean
  },
  hideCount: {
    type: Boolean
  }
})

const tree = useTemplateRef('tree')
const projects = computed(() => searchStore.indices)
const nested = ref(true)
const path = ref(core.getDefaultDataDir())
const openPaths = ref([])
const selectedPaths = computedFilterValues(props.filter)

const preBodyBuild = whenFilterContextualized(props.filter, (body) => {
  // Add every filter to the search body
  searchStore.instantiatedFilters.forEach(filter => filter.addFilter(body))
  // Add query to the search body
  core.api.elasticsearch.addQueryToFilter(searchStore.q || '*', body)
  return body
})

const reloadData = () => tree.value.reloadData()
const reset = () => (selectedPaths.value = [])

watchFilterContextualized(props.filter, reloadData)
// When the filter is excluded/included and it's contextualized then reload the data with a spinner
watchFilterExcluded(props.filter, whenFilterContextualized(props.filter, reloadData))
// When filter values change and the filter is contextualized then reload the data
watchValues(whenFilterContextualized(props.filter, reloadData))
// When project changes, we reset the filter to avoid filtering by unknown paths
watchIndices(reset)
</script>

<template>
  <filter-type
    :filter="filter"
    :modal="modal"
    flush
  >
    <template #default="{ opened }">
      <path-tree
        v-if="opened"
        ref="tree"
        v-model:selected-paths="selectedPaths"
        v-model:open-paths="openPaths"
        v-model:path="path"
        include-children-documents
        :compact="!modal"
        :projects="projects"
        :pre-body-build="preBodyBuild"
        :sort-by="filter.sortBy"
        :order-by="filter.orderBy"
        :no-stats="hideCount"
        :nested="nested"
        no-label
        no-link
        elasticsearch-only
        select-mode
        multiple
      />
    </template>
    <template #actions>
      <button-toggle-path-tree-view v-model:active="nested" />
    </template>
  </filter-type>
</template>
