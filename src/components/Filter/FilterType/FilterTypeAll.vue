<script setup>
import { computed, ref, toRef, watch } from 'vue'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import { useSearchFilter } from '@/composables/search-filter'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const { computedAll, computedTotal, searchStore } = useSearchFilter()

const all = computedAll(toRef(props, 'filter'))
const total = computedTotal(toRef(props, 'filter'))

// We track if the total was already visible before to avoid flickering
// when hidding it (e.g. when the search is not ready).
const hadTotal = ref(false)
watch(total, (value, oldValue) => (hadTotal.value = oldValue !== null))

const hideTotal = computed(() => total.value === null || (!searchStore.isReady && !hadTotal.value))
</script>

<template>
  <filters-panel-section-filter-entry
    v-model="all"
    :count="total"
    :disabled="all"
    :hide-count="hideTotal"
    :label="$t('filterTypeAll.label')"
  />
</template>
