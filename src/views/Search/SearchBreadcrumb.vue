<script setup>
import SearchBreadcrumbForm from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbForm'
import SearchBreadcrumbFormEntry from '@/components/Search/SearchBreadcrumbForm/SearchBreadcrumbFormEntry'
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
    :hide-clear-query="!hasQueryEntries"
    :hide-clear-filters="!hasFiltersEntries"
    :hide-clear-filters-and-query="!hasQueryAndFiltersEntries"
    @clear:filters="clearFiltersEntries"
    @clear:query="clearQueryEntries"
    @clear:all="clearAll"
    @save:search="showSearchSavingModal"
  >
    <search-breadcrumb-form-entry
      v-for="({ query, filter, value, noXIcon }, i) in entries"
      v-bind="{ query, filter, value, noXIcon }"
      :key="i"
      @click:x="clearEntry($event, { query, filter, value })"
    />
  </search-breadcrumb-form>
</template>
