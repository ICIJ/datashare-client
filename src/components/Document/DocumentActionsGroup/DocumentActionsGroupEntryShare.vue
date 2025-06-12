<script setup>
import { nextTick, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

import DocumentSharePopover from '@/components/Document/DocumentSharePopover/DocumentSharePopover'
import { breakpointSizeValidator, SIZE } from '@/enums/sizes'

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

const elementRef = useTemplateRef('element')

const blur = () => nextTick(() => window.document?.activeElement.blur())
</script>

<template>
  <document-actions-group-entry
    ref="element"
    class="document-actions-group-entry-share"
    icon="share-network"
    hide-tooltip
    :label="t('documentActionsGroup.share')"
    :size="size"
    @focus="blur"
  />
  <document-share-popover
    :target="elementRef"
    :offset="16"
    :boundary-padding="32"
    close-on-hide
    :document="document"
    :placement="tooltipPlacement"
  />
</template>
