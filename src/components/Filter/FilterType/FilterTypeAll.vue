<script setup>
import { computed, ref, toRef, watch } from 'vue'

import FiltersPanelSectionFilterEntry from '@/components/FiltersPanel/FiltersPanelSectionFilterEntry'
import { useSearchFilter } from '@/composables/useSearchFilter'

const props = defineProps({
  filter: {
    type: Object,
    required: true
  }
})

const { computedAll, computedTotal, searchStore } = useSearchFilter()

const all = computedAll(toRef(props, 'filter'))
// We track if the total was already visible before to avoid flickering
// when hidding it (e.g. when the search is not ready).
const hadTotal = ref(false)
const total = computedTotal(toRef(props, 'filter'))
const hideTotal = computed(() => total.value === null || !hadTotal.value)
// We need to update hadTotal after the search is ready and a total is given
watch(toRef(searchStore, 'isReady'), (value) => (hadTotal.value = value && total.value !== null))
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
