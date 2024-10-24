<script setup>
import { useSelection } from '@/composables/selection'
import DocumentRow from '@/components/Document/DocumentRow/DocumentRow'

const selection = defineModel('selection', { type: Array, default: () => [] })
const { selectionValues } = useSelection(selection)

defineProps({
  entries: {
    type: Array
  },
  compactBreakpoint: {
    type: String,
    default: 'md'
  },
  selectMode: {
    type: Boolean,
    default: false
  },
  properties: {
    type: Array,
    default: () => ['title', 'thumbnail']
  }
})
</script>

<template>
  <document-row
    v-for="entry in entries"
    :key="entry.id"
    v-model:selected="selectionValues[entry.id]"
    :document="entry"
    :properties="properties"
    :select-mode="selectMode"
  />
</template>
