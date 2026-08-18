<script setup>
import SearchBreadcrumbForm from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbForm'
import { useSearchBreadcrumb } from '@/composables/useSearchBreadcrumb'
import { useSearchSavingModal } from '@/composables/useSearchSavingModal'

const visible = defineModel('visible', { type: Boolean })

const {
  entries,
  clearEntry,
  clearFiltersEntries,
  clearQueryEntries,
  clearAll,
  unlockAll,
  hasConflictingLocks,
  applyLockedFilters,
  lockedFiltersCount,
  hasQueryEntries,
  hasFiltersEntries,
  hasQueryAndFiltersEntries
} = useSearchBreadcrumb()

const { show: showSearchSavingModal } = useSearchSavingModal()

// Force-open the panel when locks are applied so the diff is immediately
// visible, independent of the post-submission auto-open trigger. See
// icij/datashare#2332.
async function onApplyLockedFilters() {
  await applyLockedFilters()
  visible.value = true
}
</script>

<template>
  <search-breadcrumb-form
    v-model:visible="visible"
    :entries="entries"
    :disabled-clear-query="!hasQueryEntries"
    :disabled-clear-filters="!hasFiltersEntries"
    :disabled-clear-filters-and-query="!hasQueryAndFiltersEntries"
    :locked-filters-count="lockedFiltersCount"
    :has-conflicting-locks="hasConflictingLocks"
    @clear:filters="clearFiltersEntries"
    @clear:query="clearQueryEntries"
    @clear:all="clearAll"
    @unlock:all="unlockAll"
    @apply:locked-filters="onApplyLockedFilters"
    @save:search="showSearchSavingModal"
    @click:entry-x="clearEntry"
  />
</template>
