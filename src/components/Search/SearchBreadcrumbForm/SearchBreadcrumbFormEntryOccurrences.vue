<script setup>
import { computed } from 'vue'

const props = defineProps({
  occurrences: {
    type: Number,
    default: 0
  },
  previousOccurrences: {
    type: Number,
    default: 0
  }
})

const lessOccurrences = computed(() => {
  return Math.max(0, props.previousOccurrences - props.occurrences)
})
</script>

<template>
  <div
    v-b-tooltip.top="{ offset: '0' }"
    class="search-breadcrumb-form-entry-occurrences d-inline-flex px-2"
    :title="$tc('searchBreadcrumbFormEntryOccurences.title', lessOccurrences, { lessOccurrences: $n(lessOccurrences) })"
  >
    {{ $tc('searchBreadcrumbFormEntryOccurences.label', occurrences, { occurrences: $n(occurrences) }) }}
  </div>
</template>

<style lang="scss" scoped>
.search-breadcrumb-form-entry-occurrences:hover {
  text-decoration: underline;
  color: var(--bs-body-color);
}
</style>
