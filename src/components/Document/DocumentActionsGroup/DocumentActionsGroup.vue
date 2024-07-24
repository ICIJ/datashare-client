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
        icon="star"
        :label="$t('documentActionsGroup.star')"
        :tooltip-placement="tooltipPlacement"
        :fill="isStarred"
        @click="clickStar"
      />
      <document-actions-group-entry
        icon="share"
        :label="$t('documentActionsGroup.share')"
        :tooltip-placement="tooltipPlacement"
        @click="clickShare"
      />
      <document-actions-group-entry
        icon="download"
        :label="$t('documentActionsGroup.download')"
        :disabled="isDownloadAllowed"
        :tooltip-placement="tooltipPlacement"
        @click="clickDownload"
      />
      <document-actions-group-entry
        icon="arrows-out-simple"
        :label="$t('documentActionsGroup.expand')"
        :tooltip-placement="tooltipPlacement"
        @click="clickExpand"
      />
    </slot>
  </div>
</template>

<script setup>
import DocumentActionsGroupEntry from '@/components/Document/DocumentActionsGroup/DocumentActionsGroupEntry'

defineProps({
  /**
   * The selected document
   */
  document: {
    type: Object
  },
  /**
   * Use a vertical layoutk
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
</script>
