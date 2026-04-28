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
  hasQueryEntries,
  hasFiltersEntries,
  hasQueryAndFiltersEntries
} = useSearchBreadcrumb()

const { show: showSearchSavingModal } = useSearchSavingModal()
</script>

<template>
  <search-breadcrumb-form
    v-model:visible="visible"
    :entries="entries"
    :disabled-clear-query="!hasQueryEntries"
    :disabled-clear-filters="!hasFiltersEntries"
    :disabled-clear-filters-and-query="!hasQueryAndFiltersEntries"
    @clear:filters="clearFiltersEntries"
    @clear:query="clearQueryEntries"
    @clear:all="clearAll"
    @save:search="showSearchSavingModal"
    @click:entry-x="clearEntry"
  />
</template>
