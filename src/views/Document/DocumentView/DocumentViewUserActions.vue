<script setup>
import DocumentUserActions from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActions'

defineProps({
  document: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <document-user-actions :document="document" show-tags show-recommended />
</template>
