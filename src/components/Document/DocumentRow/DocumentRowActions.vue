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
  <td class="document-row-actions text-end">
    <document-actions-group
      :document="document"
      no-close
      class="d-inline-flex above-stretched-link"
    />
  </td>
</template>
