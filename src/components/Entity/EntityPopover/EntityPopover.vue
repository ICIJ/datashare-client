<script setup>
import { computed } from 'vue'
import { pick } from 'lodash'

import EntityPopoverTabGroup from './EntityPopoverTabGroup'

const modelValue = defineModel({ type: Boolean })
const offset = defineModel('offset', { type: Number, default: 0 })

const props = defineProps({
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
  },
  teleportTo: {
    type: String,
    default: 'body'
  },
  delay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  },
  customClass: {
    type: String,
    default: 'entity-popover'
  }
})

const tabsBinding = computed(() => {
  return pick(props, ['mention', 'excerpt', 'noExcerpt', 'projects', 'offsets', 'language', 'extractor'])
})
</script>

<template>
  <b-popover v-model="modelValue" :teleport-to="teleportTo" :custom-class="customClass" :delay="delay">
    <entity-popover-tab-group v-bind="tabsBinding" v-model:offset="offset" />
    <template #target="bindings">
      <slot name="target" v-bind="bindings" />
    </template>
  </b-popover>
</template>
