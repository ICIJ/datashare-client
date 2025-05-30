<script setup>
import { computed, nextTick, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

import { useDocumentDownload } from '@/composables/useDocumentDownload'
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
const { t } = useI18n()

const { isDownloadAllowed, isRootTooBig, documentFullUrl } = useDocumentDownload(document)
const elementRef = useTemplateRef('element')
const hasDownload = computed(() => isDownloadAllowed.value && !isRootTooBig.value)
const href = computed(() => (hasDownload.value ? documentFullUrl.value : null))
const blur = () => nextTick(() => window.document?.activeElement.blur())
</script>

<template>
  <document-actions-group-entry
    ref="element"
    class="document-actions-group-entry-download"
    icon="download-simple"
    download
    hide-tooltip
    :label="t('documentActionsGroup.download')"
    :vertical="vertical"
    :disabled="!isDownloadAllowed"
    :href="href"
    @click.exact.prevent
    @focus="blur"
  />
  <document-download-popover
    :target="elementRef"
    :offset="16"
    :boundary-padding="32"
    close-on-hide
    :document="document"
    :placement="tooltipPlacement"
  />
</template>
