<script setup>
import { computed } from 'vue'
import groupBy from 'lodash/groupBy'
import uniq from 'lodash/uniq'
import { useI18n } from 'vue-i18n'

import FormStep from '@/components/Form/FormStep/FormStep'
import FiltersPanelSection from '@/components/FiltersPanel/FiltersPanelSection'
import { useMode } from '@/composables/useMode'
import { useSearchFilter } from '@/composables/useSearchFilter'
import { useSearchStore } from '@/store/modules/search'

const { t } = useI18n()
const { isMode } = useMode()
const { getFilterComponent } = useSearchFilter()
const formSearchStore = useSearchStore.inject()

const isAvailableInMode = filter => !filter.modes || filter.modes.some(isMode)
const isDisplayed = filter => !filter.hidden && isAvailableInMode(filter)
const searchPageFilters = computed(() => formSearchStore.instantiatedFilters.filter(isDisplayed))

// The projects are picked in the form details step. The project filter still
// orders the sections, so they follow the same order as on the search page.
const isProjectFilter = filter => filter.name === 'project'
const filters = computed(() => searchPageFilters.value.filter(filter => !isProjectFilter(filter)))
const filtersBySection = computed(() => groupBy(filters.value, 'section'))
const sections = computed(() => uniq(searchPageFilters.value.map(filter => filter.section)))
</script>

<template>
  <form-step
    :title="t('task.batch-search.form.sections.filters')"
    :index="4"
    class="task-batch-search-form-filters"
    content-class="bg-transparent rounded-0 d-flex flex-column gap-3 px-0 m-0"
    collapse
  >
    <filters-panel-section
      v-for="section in sections"
      :key="section"
      :title="t(`filter.sections.${section}`)"
      class="d-flex flex-column gap-3"
    >
      <component
        :is="getFilterComponent(filter)"
        v-for="filter in filtersBySection[section]"
        :key="filter.name"
        :filter="filter"
        actions-position-title
        hide-contextualize
        hide-lock
        class="p-3"
        content-class="pb-0"
      />
    </filters-panel-section>
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
