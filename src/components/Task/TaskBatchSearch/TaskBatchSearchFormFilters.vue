<script setup>
import { useI18n } from 'vue-i18n'

import FormStep from '@/components/Form/FormStep/FormStep'
import FilterType from '@/components/Filter/FilterType/FilterType'
import FilterTypeDateRange from '@/components/Filter/FilterType/FilterTypeDateRange'
import FilterTypePath from '@/components/Filter/FilterType/FilterTypePath'
import FilterTypeRecommendedBy from '@/components/Filter/FilterType/FilterTypeRecommendedBy'
import FilterTypeStarred from '@/components/Filter/FilterType/FilterTypeStarred'
import ModeServerOnly from '@/components/Mode/ModeServerOnly'
import { useSearchStore } from '@/store/modules/search'

const { t } = useI18n()
const formSearchStore = useSearchStore.inject()
const filterStarred = formSearchStore.getFilter({ name: 'starred' })
const filterTags = formSearchStore.getFilter({ name: 'tags' })
const filterRecommendedBy = formSearchStore.getFilter({ name: 'recommendedBy' })
const filterPath = formSearchStore.getFilter({ name: 'path' })
const filterContentType = formSearchStore.getFilter({ name: 'contentType' })
const filterCreationDate = formSearchStore.getFilter({ name: 'creationDate' })
const filterLanguage = formSearchStore.getFilter({ name: 'language' })
const filterExtractionLevel = formSearchStore.getFilter({ name: 'extractionLevel' })
const filterIndexingDate = formSearchStore.getFilter({ name: 'indexingDate' })
</script>

<template>
  <form-step
    :title="t('task.batch-search.form.sections.filters')"
    :index="4"
    class="task-batch-search-form-filters"
    content-class="bg-transparent rounded-0 d-flex flex-column gap-3 px-0 m-0"
    collapse
  >
    <filter-type-starred
      :filter="filterStarred"
      actions-position-title
      hide-contextualize
      hide-lock
      class="p-3"
      content-class="pb-0"
    />
    <filter-type
      :filter="filterTags"
      actions-position-title
      hide-contextualize
      hide-lock
      class="p-3"
      content-class="pb-0"
    />
    <mode-server-only>
      <filter-type-recommended-by
        :filter="filterRecommendedBy"
        actions-position-title
        hide-contextualize
        hide-lock
        class="p-3"
        content-class="pb-0"
      />
    </mode-server-only>
    <filter-type-path
      :filter="filterPath"
      actions-position-title
      hide-contextualize
      hide-lock
      class="p-3"
      content-class="pb-0"
    />
    <filter-type
      :filter="filterContentType"
      actions-position-title
      hide-contextualize
      hide-lock
      class="p-3"
      content-class="pb-0"
    />
    <filter-type-date-range
      :filter="filterCreationDate"
      actions-position-title
      hide-contextualize
      hide-lock
      class="p-3"
      content-class="pb-0"
    />
    <filter-type
      :filter="filterLanguage"
      actions-position-title
      hide-contextualize
      hide-lock
      class="p-3"
      content-class="pb-0"
    />
    <filter-type
      :filter="filterExtractionLevel"
      actions-position-title
      hide-contextualize
      hide-lock
      class="p-3"
      content-class="pb-0"
    />
    <filter-type
      :filter="filterIndexingDate"
      actions-position-title
      hide-contextualize
      hide-lock
      class="p-3"
      content-class="pb-0"
    />
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
