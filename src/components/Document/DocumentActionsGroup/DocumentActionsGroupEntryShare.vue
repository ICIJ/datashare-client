<script setup>
import { useI18n } from 'vue-i18n'

import IPhShareNetwork from '~icons/ph/share-network'

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
</script>

<template>
  <document-share-popover
    close-on-hide
    lazy
    :offset="16"
    :boundary-padding="32"
    :document="document"
    :placement="tooltipPlacement"
  >
    <template #target>
      <document-actions-group-entry
        class="document-actions-group-entry-share"
        :icon="IPhShareNetwork"
        hide-tooltip
        :label="t('documentActionsGroup.share')"
        :size="size"
      />
    </template>
  </document-share-popover>
</template>
