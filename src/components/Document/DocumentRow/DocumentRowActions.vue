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
  <td class="document-row-actions">
    <document-actions-group :document="document" class="ms-auto" />
  </td>
</template>
