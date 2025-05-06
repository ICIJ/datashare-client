<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  occurrences: {
    type: Number,
    default: 0
  },
  previousOccurrences: {
    type: Number,
    default: 0
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  }
})
const { t, n } = useI18n()
const lessOccurrences = computed(() => {
  return Math.max(0, props.previousOccurrences - props.occurrences)
})
</script>

<template>
  <div
    v-b-tooltip.body.top="{ offset: '0', delay: tooltipDelay }"
    class="search-breadcrumb-form-entry-occurrences d-inline-flex px-2"
    :title="t('searchBreadcrumbFormEntryOccurrences.title', { lessOccurrences: n(lessOccurrences) }, lessOccurrences)"
  >
    {{ t('searchBreadcrumbFormEntryOccurrences.label', { occurrences: n(occurrences) }, occurrences) }}
  </div>
</template>

<style lang="scss" scoped>
.search-breadcrumb-form-entry-occurrences:hover {
  text-decoration: underline;
  color: var(--bs-body-color);
}
</style>
