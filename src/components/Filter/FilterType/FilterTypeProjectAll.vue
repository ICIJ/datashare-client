<script setup>
import { computed, ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import { useCore } from '@/composables/useCore'
import { useSearchFilter } from '@/composables/useSearchFilter'

const { core } = useCore()
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

// We track if the total was already visible before to avoid flickering
// when hidding it (e.g. when the search is not ready).
const hadTotal = ref(false)
const total = computed(() => (allProjectsSelected.value ? searchStore.total : null))
const hideTotal = computed(() => total.value === null || !hadTotal.value)
// We need to update hadTotal after the search is ready and all projects are selected
watch(toRef(searchStore, 'isReady'), value => (hadTotal.value = value && allProjectsSelected.value))
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
