<script setup>
import { computed, provide, ref, useTemplateRef, watch } from 'vue'
import uniq from 'lodash/uniq'
import ButtonTogglePathTreeView from '@/components/Button/ButtonTogglePathTreeView'
import FilterType from '@/components/Filter/FilterType/FilterType'
import PathTree from '@/components/PathTree/PathTree'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useCore } from '@/composables/useCore'
import { usePath } from '@/composables/usePath'
import { useSearchStore, useLockedFiltersStore } from '@/store/modules'
import { toLockedName } from '@/store/modules/lockedFilters'
import { LAYOUTS } from '@/enums/pathTree'

const core = useCore()
const searchStore = useSearchStore.inject()
const {
  computedFilterValues,
  computedExcludeFilter,
  setFilterValue,
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

const lockedFiltersStore = useLockedFiltersStore()
// Same `-`-prefix convention as FilterType.vue's own lockedName — path
// supports exclude mode, unlike starred/recommendedBy.
const exclude = computedExcludeFilter(props.filter)
const lockedName = computed(() => toLockedName(props.filter.name, exclude.value))

function isPathLocked(value) {
  return lockedFiltersStore.isLocked({ name: lockedName.value, value })
}

// The lock button only ever renders on an already-selected row (see
// PathTreeViewEntry.vue), so there's no unselected-value case to handle here
// — unlike FilterType.vue's toggleLock, locking never selects a value.
function toggleLockPath(value, locked) {
  if (locked) {
    lockedFiltersStore.lock({ name: lockedName.value, value, label: value })
  }
  else {
    lockedFiltersStore.unlock({ name: lockedName.value, value })
  }
}

// Consumed by PathTreeViewEntry.vue, however deep the recursive tree goes —
// every other PathTree consumer (document browser, batch download folder
// picker, etc.) never provides these, so the lock button never renders there.
provide('pathLockable', true)
provide('isPathLocked', isPathLocked)
provide('toggleLockPath', toggleLockPath)

const tree = useTemplateRef('tree')
const projects = computed(() => searchStore.indices)
const nested = ref(true)
const path = ref(core.getDefaultDataDir())
const openPaths = ref([])
const selectedPaths = computedFilterValues(props.filter, {
  // computedFilterValues' default setter replaces the whole values array
  // rather than adding/removing one value at a time, bypassing
  // useSearchFilter's central unlock-on-remove path — unlock explicitly for
  // any path dropped from the selection, same as FilterTypeRecommendedBy.
  set(values) {
    for (const value of selectedPaths.value) {
      if (!values.includes(value)) {
        lockedFiltersStore.unlock({ name: lockedName.value, value })
      }
    }
    setFilterValue(props.filter, { key: values })
  }
})
const { getAncestorPaths } = usePath(selectedPaths)

// Pre-open ancestor directories of selected paths so the tree
// reveals them immediately instead of requiring manual expansion.
watch(selectedPaths, (paths) => {
  if (!paths.length) return
  const basePath = path.value
  const ancestors = paths.flatMap(p => getAncestorPaths(p, basePath))
  openPaths.value = uniq([...openPaths.value, ...ancestors])
}, { immediate: true })

const preBodyBuild = whenFilterContextualized(props.filter, (body) => {
  // Add every filter to the search body
  searchStore.instantiatedFilters.forEach(filter => filter.addFilter(body))
  // Add query to the search body
  core.api.elasticsearch.addQueryToFilter(searchStore.q || '*', body)
  return body
})

const reloadData = () => tree.value.reloadData()
const reset = () => (selectedPaths.value = [])

const layout = computed({
  get: () => nested.value ? LAYOUTS.TREE : LAYOUTS.LIST,
  set: (value) => {
    nested.value = value === LAYOUTS.TREE
  }
})

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
        :layout="layout"
        no-documents
        no-label
        no-search
        no-tree
        select-mode
        multiple
      />
    </template>
    <template #actions>
      <button-toggle-path-tree-view v-model:active="nested" />
    </template>
  </filter-type>
</template>
