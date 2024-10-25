<script setup>
import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

defineProps({
  /**
   * The current document
   */
  document: {
    type: Object
  },
  /**
   * Position of the button tooltip
   */
  tooltipPlacement: {
    type: String,
    default: 'bottom'
  },
  /**
   * Use vertical layout for the button
   */
  vertical: {
    type: Boolean
  }
})
</script>

<template>
  <document-actions-group-entry
    icon="arrows-out-simple"
    :label="$t('documentActionsGroup.expand')"
    :tooltip-placement="tooltipPlacement"
    :vertical="vertical"
  />
</template>
