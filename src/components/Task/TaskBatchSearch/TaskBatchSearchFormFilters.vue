<script setup>
import { inject } from 'vue'

import FormStep from '@/components/Form/FormStep/FormStep'
import FilterTypePath from '@/components/Filter/FilterType/FilterTypePath'
import FilterType from '@/components/Filter/FilterType/FilterType'
import { useSearchStore } from '@/store/modules/search'

const formSearchStore = useSearchStore.instantiate(inject('searchStoreSuffix'))

// We register a new filter for the excluded tags. It's ok to put this directly in the
// setup function without because the addition is idempotent.
formSearchStore.addFilter({
  type: 'FilterTag',
  options: {
    name: 'tags-excluded',
    key: 'tags',
    icon: 'tag',
    order: 20,
    section: 'userData',
    preference: 'filter-tags'
  }
})
// This filter must be "excluded" in the store
formSearchStore.excludeFilter('tags-excluded')

const filterPath = formSearchStore.getFilter({ name: 'path' })
const filterTags = formSearchStore.getFilter({ name: 'tags' })
const filterTagsExcluded = formSearchStore.getFilter({ name: 'tags-excluded' })
const filterContentType = formSearchStore.getFilter({ name: 'contentType' })
</script>

<template>
  <form-step
    :title="$t('task.batch-search.form.sections.filters')"
    :index="4"
    class="task-batch-search-form-filters"
    collapse
  >
    <filter-type-path :filter="filterPath" actions-position-title hide-contextualize hide-exclude class="p-3" />
    <filter-type :filter="filterTags" actions-position-title hide-contextualize hide-exclude class="p-3" />
    <filter-type :filter="filterTagsExcluded" actions-position-title hide-contextualize hide-exclude class="p-3" />
    <filter-type :filter="filterContentType" actions-position-title hide-contextualize hide-exclude class="p-3" />
  </form-step>
</template>

<style lang="scss" scoped>
.task-batch-search-form-filters {
  &:deep(.form-step-content) {
    background: none;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 0;
    padding-inline: 0;
    padding-bottom: 0
  }

  &:deep(.filters-panel-section-filter) {
    background: var(--bs-body-bg);
    margin: 0;
  }
}
</style>
