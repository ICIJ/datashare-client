<script setup>
import { computed } from 'vue'
import { pick } from 'lodash'

import EntityPopoverTabGroup from './EntityPopoverTabGroup'

const modelValue = defineModel({ type: Boolean })
const offset = defineModel('offset', { type: Number, default: 0 })

const props = defineProps({
  target: {
    type: [String, Object, Function]
  },
  manual: {
    type: Boolean
  },
  noAutoClose: {
    type: Boolean
  },
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
  },
  excerpt: {
    type: String
  },
  noExcerpt: {
    type: Boolean
  }
})

const tabsBinding = computed(() => {
  return pick(props, ['mention', 'excerpt', 'noExcerpt', 'projects', 'offsets', 'language', 'extractor'])
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
    <entity-popover-tab-group v-bind="tabsBinding" v-model:offset="offset" />
  </b-popover>
</template>
