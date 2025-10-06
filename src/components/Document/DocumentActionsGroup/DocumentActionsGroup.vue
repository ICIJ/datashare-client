<template>
  <div
    class="document-actions-group"
    :class="classList"
  >
    <hook
      name="document-actions-group:before"
      :bind="{ document }"
    />
    <document-card-checkbox
      v-if="selectMode"
      v-model="selected"
      class="document-actions-group__checkbox"
    />
    <slot
      name="actions"
      v-bind="{ document, tooltipPlacement, vertical }"
    >
      <document-actions-group-entry-star
        :document="document"
        :size="size"
        :tooltip-placement="tooltipPlacement"
      />
      <document-actions-group-entry-share
        :document="document"
        :size="size"
        :tooltip-placement="tooltipPlacement"
      />
      <document-actions-group-entry-download
        :document="document"
        :size="size"
        :tooltip-placement="tooltipPlacement"
      />
      <document-actions-group-entry-expand
        v-if="!modal"
        :document="document"
        :size="size"
        :tooltip-placement="tooltipPlacement"
      />
      <document-actions-group-entry-close
        v-if="modal || !noClose"
        :document="document"
        :size="size"
        :tooltip-placement="tooltipPlacement"
        @click="onClose"
      />
    </slot>
    <hook
      name="document-actions-group:after"
      :bind="{ document }"
    />
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'

import DocumentActionsGroupEntryClose from './DocumentActionsGroupEntryClose'
import DocumentActionsGroupEntryDownload from './DocumentActionsGroupEntryDownload'
import DocumentActionsGroupEntryExpand from './DocumentActionsGroupEntryExpand'
import DocumentActionsGroupEntryShare from './DocumentActionsGroupEntryShare'
import DocumentActionsGroupEntryStar from './DocumentActionsGroupEntryStar'

import DocumentCardCheckbox from '@/components/Document/DocumentCard/DocumentCardCheckbox'
import Hook from '@/components/Hook/Hook'
import { PLACEMENT, placementValidator } from '@/enums/placements'
import { breakpointSizeValidator, SIZE } from '@/enums/sizes'
import { useModalController } from 'bootstrap-vue-next'
import { useRouter } from 'vue-router'
import useSearchNav from '@/composables/useSearchNav'

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
   * Size of the actions group
   * @values 'xs', 'sm', 'md', 'lg', 'xl'
   */
  size: {
    type: String,
    default: SIZE.SM,
    validator: breakpointSizeValidator
  },
  /**
   * When true the close button is not displayed
   */
  noClose: {
    type: Boolean
  }
})

const modal = inject('modal', undefined)

const classList = computed(() => {
  return {
    'document-actions-group--vertical': vertical
  }
})

const modalController = useModalController()
const { searchRouteWithoutRefresh } = useSearchNav()
const router = useRouter()

async function onClose() {
  if (modal) {
    return modalController.hide()
  }
  return router.push(searchRouteWithoutRefresh.value)
}
</script>

<style lang="scss" scoped>
.document-actions-group {
  display: flex;
  align-items: center;
  min-width: auto;
  gap: $spacer-xs;

  &--vertical {
    flex-direction: column;
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
