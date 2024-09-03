<script setup>
import { TinyPagination } from '@icij/murmur-next'

import EntityPopoverMentionOccurrences from '@/components/EntityPopover/EntityPopoverMentionOccurrences'
import EntityPopoverMentionExcerpt from '@/components/EntityPopover/EntityPopoverMentionExcerpt'
const mentionIndex = defineModel({ type: Number })
defineProps({
  mention: { type: String },
  excerpt: { type: String },
  projects: { type: Array, default: () => [] },
  nbMentions: { type: Number }
})
</script>
<template>
  <div class="d-flex flex-column align-items-center gap-3">
    <entity-popover-mention-excerpt :mention="mention" :excerpt="excerpt" />
    <tiny-pagination v-model="mentionIndex" :per-page="1" :total-rows="nbMentions" compact />
    <entity-popover-mention-occurrences
      :nb-mentions="nbMentions"
      :projects="projects"
      class="text-secondary-emphasis"
    />
  </div>
</template>
