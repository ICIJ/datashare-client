<script setup>
import { computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

import IPhDownloadSimple from '~icons/ph/download-simple'

import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

import { useDocumentDownload } from '@/composables/useDocumentDownload'
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

const { isDownloadAllowed, isRootTooBig, documentFullUrl } = useDocumentDownload(document)
const hasDownload = computed(() => isDownloadAllowed.value && !isRootTooBig.value)
const href = computed(() => (hasDownload.value ? documentFullUrl.value : null))
const blur = () => nextTick(() => window.document?.activeElement.blur())
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
      <document-actions-group-entry
        ref="element"
        class="document-actions-group-entry-download"
        :icon="IPhDownloadSimple"
        download
        hide-tooltip
        :size="size"
        :label="t('documentActionsGroup.download')"
        :disabled="!isDownloadAllowed"
        :href="href"
        @click.exact.prevent
        @focus="blur"
      />
    </template>
  </document-download-popover>
</template>
