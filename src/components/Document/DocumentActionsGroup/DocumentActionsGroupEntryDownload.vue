<script setup>
import { computed, useTemplateRef } from 'vue'
import { useStore } from 'vuex'

import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

import DocumentDownloadPopover from '@/components/Document/DocumentDownloadPopover/DocumentDownloadPopover'

const { document } = defineProps({
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

const store = useStore()

const isDownloadAllowed = computed(() => {
  // Use nullish coalescing operator to allow download if the store/getter is undefined
  return store?.getters['downloads/isDownloadAllowed'](document) ?? true
})
</script>

<template>
  <span>
    <document-actions-group-entry
      ref="element"
      icon="download-simple"
      :label="$t('documentActionsGroup.download')"
      hide-tooltip
      :vertical="vertical"
      :disabled="!isDownloadAllowed"
    />
    <document-download-popover
      :target="elementRef"
      :offset="16"
      close-on-hide
      :document="document"
      :placement="tooltipPlacement"
    />
  </span>
</template>
