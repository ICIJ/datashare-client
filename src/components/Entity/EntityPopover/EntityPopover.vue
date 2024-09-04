<template>
  <b-popover
    teleport-to="body"
    :target="target"
    :manual="manual"
    :model-value="modelValue"
    :no-auto-close="noAutoClose"
    :placement="placement"
    custom-class="document-download-popover"
    @update:modelValue="$emit('update:modelValue')"
  >
    <entity-popover-tab-group v-bind="mentionTabsProps" />
  </b-popover>
</template>
<script setup>
import { computed } from 'vue'

import EntityPopoverTabGroup from './EntityPopoverTabGroup'

const props = defineProps({
  /**
   * The target element
   */
  target: {
    type: Object
  },
  /**
   * Toggle value when the popover is open
   */
  modelValue: {
    type: Boolean
  },
  /**
   * True if the popover is open manually
   */
  manual: {
    type: Boolean
  },
  /**
   * Disable auto close
   */
  noAutoClose: {
    type: Boolean
  },
  /**
   * The placement of the popover
   */
  placement: {
    type: String
  },
  mention: { type: String },
  excerpt: { type: String },
  projects: { type: Array, default: () => [] },
  nbMentions: { type: Number },
  language: { type: String },
  model: { type: String }
})

const mentionTabsProps = computed(() => {
  return {
    mention: props.mention,
    excerpt: props.excerpt,
    projects: props.projects,
    nbMentions: props.nbMentions,
    language: props.language,
    model: props.model
  }
})
</script>
