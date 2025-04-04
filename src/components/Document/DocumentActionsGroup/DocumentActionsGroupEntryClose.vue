<script setup>
import { useModalController } from 'bootstrap-vue-next'

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

const modalController = useModalController()
</script>

<template>
  <document-actions-group-entry
    :icon="PhX"
    :label="$t('documentActionsGroup.close')"
    :tooltip-placement="tooltipPlacement"
    :vertical="vertical"
    hide-tooltip
    @click="modalController.hide()"
  />
</template>
