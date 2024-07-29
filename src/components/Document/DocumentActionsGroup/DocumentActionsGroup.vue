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

const { t } = useI18n()

const ACTION = {
  STAR: 'star',
  SHARE: 'share',
  DOWNLOAD: 'download',
  EXPAND: 'expand'
}

const click = (action) => {
  return emit(`click-${action}`, { id: document.id })
}
const entries = computed(() => {
  return [
    {
      name: ACTION.STAR,
      icon: 'arrows-out-simple',
      label: t(`documentActionsGroup.${ACTION.STAR}`),
      fill: props.isStarred,
      event: click(ACTION.STAR)
    },
    {
      name: ACTION.SHARE,
      icon: 'share',
      label: t(`documentActionsGroup.${ACTION.SHARE}`),
      event: click(ACTION.SHARE)
    },
    {
      name: ACTION.DOWNLOAD,
      icon: 'download-simple',
      label: t(`documentActionsGroup.${ACTION.DOWNLOAD}`),
      disabled: !props.isDownloadAllowed,
      hideTooltip: true,
      event: click(ACTION.DOWNLOAD)
    },
    {
      name: ACTION.EXPAND,
      icon: 'arrows-out-simple',
      label: t(`documentActionsGroup.${ACTION.EXPAND}`),
      event: click(ACTION.EXPAND)
    }
  ]
})
</script>
