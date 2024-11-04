<script setup>
import { computed } from 'vue'
import { pick } from 'lodash'

import EntityPopoverTabGroup from './EntityPopoverTabGroup'

const modelValue = defineModel({ type: Boolean })
const offset = defineModel('offset', { type: Number, default: 1 })

const props = defineProps({
  /**
   * The target element
   */
  target: {
    type: [String, Object, Function],
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
  teleportTo: {
    type: String,
    default: 'body'
  },
  mention: {
    type: String
  },
  excerpt: {
    type: String
  },
  projects: {
    type: Array,
    default: () => []
  },
  offsets: {
    type: Number
  },
  language: {
    type: String
  },
  extractor: {
    type: String
  }
})

const mentionTabsBinding = computed(() => {
  return pick(props, ['mention', 'excerpt', 'projects', 'offsets', 'language', 'extractor'])
})
</script>

<template>
  <b-popover
    v-model="modelValue"
    :teleport-to="teleportTo"
    :target="target"
    :manual="manual"
    :no-auto-close="noAutoClose"
    :placement="placement"
    custom-class="entity-popover"
  >
    <entity-popover-tab-group v-bind="mentionTabsBinding" v-model:offset="offset" />
  </b-popover>
</template>
