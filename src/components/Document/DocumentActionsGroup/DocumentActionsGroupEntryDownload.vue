<script setup>
import { computed, useTemplateRef, nextTick } from 'vue'

import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

import { useDocumentDownload } from '@/composables/document-download'
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

const { isDownloadAllowed, isRootTooBig, documentFullUrl } = useDocumentDownload(document)
const elementRef = useTemplateRef('element')
const hasDownload = computed(() => isDownloadAllowed.value && !isRootTooBig.value)
const href = computed(() => (hasDownload.value ? documentFullUrl.value : null))
const blur = () => nextTick(() => window.document?.activeElement.blur())
</script>

<template>
  <span>
    <document-actions-group-entry
      ref="element"
      icon="download-simple"
      download
      hide-tooltip
      :label="$t('documentActionsGroup.download')"
      :vertical="vertical"
      :disabled="!isDownloadAllowed"
      :href="href"
      @focus="blur"
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
