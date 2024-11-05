<script setup>
import { computed } from 'vue'
import { TinyPagination } from '@icij/murmur-next'

import EntityPopoverMentionOccurrences from './EntityPopoverMentionOccurrences'
import EntityPopoverMentionExcerpt from './EntityPopoverMentionExcerpt'

const offset = defineModel('offset', { type: Number, default: 0 })
const page = computed({
  get: () => offset.value + 1,
  set: (value) => (offset.value = value - 1)
})

defineProps({
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
  }
})
</script>

<template>
  <div class="d-flex flex-column align-items-center gap-3">
    <entity-popover-mention-excerpt :mention="mention" :excerpt="excerpt" />
    <tiny-pagination v-if="offsets > 1" v-model="page" :per-page="1" :total-rows="offsets" compact />
    <entity-popover-mention-occurrences :offsets="offsets" :projects="projects" class="text-secondary-emphasis" />
  </div>
</template>
