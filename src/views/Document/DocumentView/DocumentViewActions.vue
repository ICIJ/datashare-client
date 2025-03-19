<script setup>
import DocumentActionsGroup from '@/components/Document/DocumentActionsGroup/DocumentActionsGroup'

defineProps({
  document: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <document-actions-group class="document-view-actions" :document="document" />
</template>
