<template>
  <div class="document-actions-group d-flex align-items-center" :class="{ 'flex-column': vertical }">
    <b-form-checkbox
      v-if="selectMode"
      class="m-2"
      :model-value="selected"
      name="checkbox"
      @update:modelValue="$emit('update:selected', $event)"
    />
    <slot name="actions" v-bind="{ document }">
      <document-actions-group-entry
        v-for="entry in entries"
        ref="entryButtons"
        :key="entry.name"
        :tooltip-placement="tooltipPlacement"
        v-bind="entry"
      />
      <document-download-popover
        v-if="entryButtons !== null"
        :target="entryButtons[2]"
        :document="document"
        :placement="tooltipPlacement"
      />
    </slot>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import DocumentActionsGroupEntry from './DocumentActionsGroupEntry'

import DocumentDownloadPopover from '@/components/Document/DocumentDownloadPopover/DocumentDownloadPopover'

const entryButtons = ref(null)

const props = defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object
  },
  /**
   * Use a vertical layout
   */
  vertical: {
    type: Boolean
  },
  /**
   * Tooltip's placement on each action using Floating UI: https://floating-ui.com/docs/tutorial#placements
   * @values 'auto', 'auto-start', 'auto-end', 'top', 'right', 'bottom', 'left', 'top-start', 'right-start', 'bottom-start', 'left-start', 'top-end', 'right-end', 'bottom-end', 'left-end'
   */
  tooltipPlacement: {
    type: String,
    default: 'top'
  },
  /**
   * True if download is allowed for the document
   */
  isDownloadAllowed: {
    type: Boolean
  },
  /**
   * True if download is allowed for the document
   */
  isStarred: {
    type: Boolean
  },
  /**
   * True if selectMode is allowed
   */
  selectMode: {
    type: Boolean
  },
  /**
   * True if checkbox is selected
   */
  selected: {
    type: Boolean
  }
})

const emit = defineEmits(['click-star', 'click-download', 'click-share', 'click-expand', 'update:selected'])

const clickStar = () => {
  emit('click-star', { id: document.id })
}
const clickDownload = () => {
  emit('click-download', { id: document.id })
}
const clickShare = () => {
  emit('click-share', { id: document.id })
}
const clickExpand = () => {
  emit('click-expand', { id: document.id })
}
const { t } = useI18n()
const entries = computed(() => {
  return [
    {
      name: 'star',
      icon: 'arrows-out-simple',
      label: t('documentActionsGroup.star'),
      fill: props.isStarred,
      event: clickStar
    },
    {
      name: 'share',
      icon: 'share',
      label: t('documentActionsGroup.share'),
      event: clickShare
    },
    {
      name: 'download',
      icon: 'download-simple',
      label: t('documentActionsGroup.download'),
      disabled: !props.isDownloadAllowed,
      hideTooltip: true,
      event: clickDownload
    },
    {
      name: 'expand',
      icon: 'arrows-out-simple',
      label: t('documentActionsGroup.expand'),
      event: clickExpand
    }
  ]
})
</script>
