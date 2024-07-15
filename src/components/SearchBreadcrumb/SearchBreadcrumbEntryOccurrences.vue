<script setup>
defineProps({
  occurrences: {
    type: Number,
    default: 0
  }
})
</script>

<template>
  <div class="search-breadcrumb-entry-occurrences d-inline-flex p-2 mb-2">
    {{ $tc('searchBreadcrumbEntryOccurences.label', occurrences, { occurrences: $n(occurrences) }) }}
  </div>
</template>
