<script setup>
import { computed, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhDownloadSimple from '~icons/ph/download-simple'

import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

import { useDocumentDownload } from '@/composables/useDocumentDownload'
import { useElementVisibilityOnce } from '@/composables/useElementVisibilityOnce'
import DocumentDownloadPopover from '@/components/Document/DocumentDownloadPopover/DocumentDownloadPopover'
import { breakpointSizeValidator, SIZE } from '@/enums/sizes'

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
   * Size of the actions group
   * @values 'xs', 'sm', 'md', 'lg', 'xl'
   */
  size: {
    type: String,
    default: SIZE.MD,
    validator: breakpointSizeValidator
  }
})

const { t } = useI18n()

const element = useTemplateRef('element')
const isVisible = useElementVisibilityOnce(element)
const { isDownloadAllowed, documentFullUrl, fetchDownloadStatus } = useDocumentDownload(() => document, { immediate: false })
// Probe once the row scrolls into view, and again whenever a recycled row is
// handed a different document while it stays mounted. The store memoizes per
// document, so re-probing a document already seen costs nothing.
watch([isVisible, () => document?.id], ([visible]) => {
  if (visible) {
    fetchDownloadStatus()
  }
})
const href = computed(() => (isDownloadAllowed.value ? documentFullUrl.value : null))
</script>

<template>
  <document-download-popover
    close-on-hide
    lazy
    :offset="16"
    :boundary-padding="32"
    :document="document"
    :placement="tooltipPlacement"
  >
    <template #target>
      <!--
        Never disabled: this button opens the download popover, which still
        offers the extracted text, the translations and the root document even
        when the source itself cannot be served. Only the direct-download href
        is withheld.
      -->
      <document-actions-group-entry
        ref="element"
        class="document-actions-group-entry-download"
        :icon="IPhDownloadSimple"
        download
        hide-tooltip
        :size="size"
        :label="t('documentActionsGroup.download')"
        :href="href"
        @click.exact.prevent
      />
    </template>
  </document-download-popover>
</template>
