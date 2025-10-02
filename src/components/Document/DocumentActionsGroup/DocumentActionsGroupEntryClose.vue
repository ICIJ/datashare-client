<script setup>
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
  }
})
const { t } = useI18n()

</script>

<template>
  <document-actions-group-entry
    class="document-actions-group-entry-close"
    :icon="PhX"
    :label="t('documentActionsGroup.close')"
    :tooltip-placement="tooltipPlacement"
    hide-tooltip
  />
</template>
