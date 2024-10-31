<script setup>
import DocumentSearchNav from '@/components/Document/DocumentSearchNav/DocumentSearchNav'

defineProps({
  document: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <document-search-nav :document="document" />
</template>
