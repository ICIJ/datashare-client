<script setup>
import { useTemplateRef } from 'vue'

import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

import DocumentSharePopover from '@/components/Document/DocumentSharePopover/DocumentSharePopover'

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

const elementRef = useTemplateRef('element')
const popoverRef = useTemplateRef('popover')
</script>

<template>
  <span>
    <document-actions-group-entry
      ref="element"
      icon="share-network"
      hide-tooltip
      :label="$t('documentActionsGroup.share')"
      :vertical="vertical"
      @focus="popoverRef?.hide"
    />
    <document-share-popover
      ref="popover"
      :target="elementRef"
      :offset="16"
      close-on-hide
      :document="document"
      :placement="tooltipPlacement"
    />
  </span>
</template>
