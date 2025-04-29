<script setup>
import SearchBreadcrumbUri from '@/components/Search/SearchBreadcrumbUri/SearchBreadcrumbUri'

defineProps({
  uri: {
    type: String,
    required: true
  }
})
</script>

<template>
  <search-breadcrumb-uri :key="uri" :uri="uri" class="pt-3" />
</template>
