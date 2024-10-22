<script setup>
import DocumentRow from '@/components/Document/DocumentRow/DocumentRow'

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
    :document="entry"
    :properties="properties"
    :select-mode="selectMode"
  />
</template>
