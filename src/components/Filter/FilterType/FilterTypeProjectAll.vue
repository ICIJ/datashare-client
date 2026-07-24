<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import { useCore } from '@/composables/useCore'
import { useSearchFilter } from '@/composables/useSearchFilter'

const core = useCore()
const { allProjectsSelected, searchStore } = useSearchFilter()

const { t } = useI18n()
const all = computed({
  get() {
    return allProjectsSelected.value
  },
  set(value) {
    if (value) {
      hadTotal.value = false
      searchStore.setIndices(core.projectIds)
    }
  }
})

// null while loading to prevent flickering a stale count before the fetch completes.
const hadTotal = ref(false)
const total = computed(() => (allProjectsSelected.value ? searchStore.total : null))
const hideTotal = computed(() => total.value === null || !hadTotal.value)
watch(total, (value) => {
  if (value !== null) hadTotal.value = true
}, { immediate: true })
</script>

<template>
  <filters-panel-section-filter-entry
    v-model="all"
    :count="total"
    :disabled="all"
    :hide-count="hideTotal"
    :label="t('filterTypeAll.label')"
  />
</template>
