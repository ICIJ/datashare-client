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
  },
  // Suppresses the per-row lock button entirely. See FilterType.vue's
  // hideLock for why (disposable/unrelated screens rendering against a
  // non-live search store).
  hideLock: {
    type: Boolean
  }
})

const lockedFiltersStore = useLockedFiltersStore()
// Same `-`-prefix convention as FilterType.vue's own lockedName — path
// supports exclude mode, unlike starred/recommendedBy.
const exclude = computedExcludeFilter(props.filter)
const lockedName = computed(() => toLockedName(props.filter.name, exclude.value))

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
const { getAncestorPaths, normalizeDirectory } = usePath(selectedPaths)

// A tree row's own `path` model isn't normalized (it's the raw ES bucket key
// or browsed-to directory), but selecting one always stores its
// normalizeDirectory()-ed form (trailing separator included, see usePath.js)
// — locking/checking the raw form would silently record a different string
// than what's actually applied, producing a second, duplicate-looking
// breadcrumb chip on the next hydration. Normalize here so the lock entry's
// value always matches the real applied filter value.
function isPathLocked(value) {
  return lockedFiltersStore.isLocked({ name: lockedName.value, value: normalizeDirectory(value) })
}

// The lock button now renders on every row, hover-revealed (see
// PathTreeViewEntry.vue) — same select+lock convention as every other filter
// type in this epic, so locking an unselected row selects it too.
function toggleLockPath(value, locked) {
  const normalized = normalizeDirectory(value)
  if (locked) {
    lockedFiltersStore.lock({ name: lockedName.value, value: normalized, label: normalized })
    if (!selectedPaths.value.includes(normalized)) {
      selectedPaths.value = [...selectedPaths.value, normalized]
    }
  }
  else {
    lockedFiltersStore.unlock({ name: lockedName.value, value: normalized })
  }
}

// Consumed by PathTreeViewEntry.vue, however deep the recursive tree goes —
// every other PathTree consumer (document browser, batch download folder
// picker, etc.) never provides these, so the lock button never renders there.
// hideLock suppresses it the same way for this consumer too (disposable
// screens rendering against a non-live search store, e.g. batch search).
const pathLockable = computed(() => !props.hideLock)
provide('pathLockable', pathLockable)
provide('isPathLocked', isPathLocked)
provide('toggleLockPath', toggleLockPath)

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
