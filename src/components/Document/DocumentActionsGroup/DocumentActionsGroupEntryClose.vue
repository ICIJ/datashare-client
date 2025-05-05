<script setup>
import { useModalController } from 'bootstrap-vue-next'
import { useI18n } from 'vue-i18n'

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
const { t } = useI18n()

const modalController = useModalController()
</script>

<template>
  <document-actions-group-entry
    class="document-actions-group-entry-close"
    :icon="PhX"
    :label="t('documentActionsGroup.close')"
    :tooltip-placement="tooltipPlacement"
    :vertical="vertical"
    hide-tooltip
    @click="modalController.hide()"
  />
</template>
