<script setup>
import { inject } from 'vue'

import FormStep from '@/components/Form/FormStep/FormStep'
import FilterTypePath from '@/components/Filter/FilterType/FilterTypePath'
import FilterType from '@/components/Filter/FilterType/FilterType'
import { useSearchStore } from '@/store/modules/search'

const formSearchStore = useSearchStore.create(inject('searchStoreSuffix'))
const filterPath = formSearchStore.getFilter({ name: 'path' })
const filterTags = formSearchStore.getFilter({ name: 'tags' })
const filterContentType = formSearchStore.getFilter({ name: 'contentType' })
const filterLanguage = formSearchStore.getFilter({ name: 'language' })
</script>

<template>
  <form-step
    :title="$t('task.batch-search.form.sections.filters')"
    :index="4"
    class="task-batch-search-form-filters"
    content-class="bg-transparent rounded-0 d-flex flex-column gap-3 px-0 m-0"
    collapse
  >
    <filter-type-path :filter="filterPath" actions-position-title hide-contextualize class="p-3" content-class="pb-0" />
    <filter-type :filter="filterTags" actions-position-title hide-contextualize class="p-3" content-class="pb-0" />
    <filter-type
      :filter="filterContentType"
      actions-position-title
      hide-contextualize
      class="p-3"
      content-class="pb-0"
    />
    <filter-type :filter="filterLanguage" actions-position-title hide-contextualize class="p-3" content-class="pb-0" />
  </form-step>
</template>

<style lang="scss" scoped>
.task-batch-search-form-filters {
  &:deep(.filters-panel-section-filter) {
    background: var(--bs-body-bg);
    margin: 0;
  }
}
</style>
