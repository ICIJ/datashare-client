<template>
  <div class="document-actions-group" :class="classList">
    <div class="document-actions-group__checkbox">
      <b-form-checkbox
        v-if="selectMode"
        aria-label="Select this document"
        :model-value="selected"
        name="checkbox"
        @update:modelValue="$emit('update:selected', $event)"
      >
        <span class="visually-hidden">Select this document</span>
      </b-form-checkbox>
    </div>
    <slot name="actions" v-bind="{ document }">
      <document-actions-group-entry
        v-for="entry in entries"
        ref="entryButtons"
        :key="entry.name"
        :size="entrySize"
        :icon-size="entryIconSize"
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

const entrySize = computed(() => {
  return props.vertical ? 'sm' : 'md'
})

const entryIconSize = computed(() => {
  return props.vertical ? 'lg' : 'md'
})

const classList = computed(() => {
  return { 'document-actions-group--vertical': props.vertical }
})

const entries = computed(() => {
  return [
    {
      name: ACTION.STAR,
      icon: 'star',
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
