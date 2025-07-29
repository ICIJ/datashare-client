<script setup>
import { computed } from 'vue'
import { TinyPagination } from '@icij/murmur-next'
import { useI18n } from 'vue-i18n'

import EntityPopoverMentionOccurrences from './EntityPopoverMentionOccurrences'
import EntityPopoverMentionExcerpt from './EntityPopoverMentionExcerpt'

const offset = defineModel('offset', { type: Number, default: 0 })
const page = computed({
  get: () => offset.value + 1,
  set: value => (offset.value = value - 1)
})

defineProps({
  mention: {
    type: String
  },
  excerpt: {
    type: String
  },
  noExcerpt: {
    type: Boolean
  },
  projects: {
    type: Array,
    default: () => []
  },
  offsets: {
    type: Number
  }
})
const { t } = useI18n()
</script>

<template>
  <div class="d-flex flex-column align-items-center gap-3">
    <template v-if="noExcerpt">
      <div class="alert alert-warning m-0">
        {{ t('entityPopoverMention.noExcerpt') }}
      </div>
    </template>
    <template v-else>
      <entity-popover-mention-excerpt
        :mention="mention"
        :excerpt="excerpt"
      />
      <tiny-pagination
        v-if="offsets > 1"
        v-model="page"
        :per-page="1"
        :total-rows="offsets"
        compact
      />
    </template>
    <entity-popover-mention-occurrences
      :offsets="offsets"
      :projects="projects"
      class="text-secondary-emphasis"
    />
  </div>
</template>
