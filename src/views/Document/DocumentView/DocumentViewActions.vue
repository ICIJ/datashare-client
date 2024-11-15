<script setup>
import DocumentActionsGroup from '@/components/Document/DocumentActionsGroup/DocumentActionsGroup'

defineProps({
  document: {
    type: Object,
    required: true
  },
  modal: {
    type: Boolean
  }
})
</script>

<template>
  <div class="docuemnt-view-actions">
    <document-actions-group :document="document" :modal="modal" />
  </div>
</template>
