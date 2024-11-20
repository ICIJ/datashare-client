<template>
  <div class="document-actions-group" :class="classList">
    <div class="document-actions-group__checkbox">
      <b-form-checkbox v-if="selectMode" v-model="selected" aria-label="Select this document" name="checkbox">
        <span class="visually-hidden">Select this document</span>
      </b-form-checkbox>
    </div>
    <slot name="actions" v-bind="{ document, tooltipPlacement, vertical }">
      <document-actions-group-entry-star
        :document="document"
        :tooltip-placement="tooltipPlacement"
        :vertical="vertical"
      />
      <document-actions-group-entry-share
        :document="document"
        :tooltip-placement="tooltipPlacement"
        :vertical="vertical"
      />
      <document-actions-group-entry-download
        :document="document"
        :tooltip-placement="tooltipPlacement"
        :vertical="vertical"
      />
      <document-actions-group-entry-expand
        :document="document"
        :modal="modal"
        :tooltip-placement="tooltipPlacement"
        :vertical="vertical"
      />
    </slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import DocumentActionsGroupEntryDownload from './DocumentActionsGroupEntryDownload'
import DocumentActionsGroupEntryExpand from './DocumentActionsGroupEntryExpand'
import DocumentActionsGroupEntryShare from './DocumentActionsGroupEntryShare'
import DocumentActionsGroupEntryStar from './DocumentActionsGroupEntryStar'

import { PLACEMENT, placementValidator } from '@/enums/placements'

/**
 * True if checkbox is selected
 */
const selected = defineModel('selected', { type: Boolean })

const { vertical } = defineProps({
  /**
   * The current document
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
    default: PLACEMENT.TOP,
    validator: placementValidator
  },
  /**
   * True if selectMode is allowed
   */
  selectMode: {
    type: Boolean
  },
  /**
   * True if the current document is displayed within a modal
   */
  modal: {
    type: Boolean
  }
})

const classList = computed(() => {
  return {
    'document-actions-group--vertical': vertical
  }
})
</script>

<style lang="scss" scoped>
.document-actions-group {
  display: flex;
  align-items: center;

  &--vertical {
    flex-direction: column;
    gap: $spacer-xs;
  }

  &__checkbox {
    &:deep(.form-check) {
      padding: 0;
      margin: 0;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      .form-check-input {
        margin: 0 $btn-padding-x;
        float: none;
      }

      .form-check-label {
        display: block;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
      }
    }
  }
}
</style>
