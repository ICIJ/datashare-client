<script setup>
import { computed } from 'vue'

import IconButton from '@/components/IconButton'

const props = defineProps({
  page: {
    type: Number,
    default: 1
  },
  perPage: {
    type: Number,
    default: 25
  },
  total: {
    type: Number,
    default: 0
  }
})

const nextPageSize = computed(() => {
  return Math.min(props.perPage, props.total - props.page * props.perPage)
})

const directoriesLeft = computed(() => {
  return Math.max(0, props.total - props.page * props.perPage)
})
</script>

<template>
  <icon-button
    v-if="directoriesLeft > 0"
    icon-left="caret-down"
    icon-left-variant="primary"
    class="py-2 px-3 shadow-sm"
    variant="outline-tertiary"
  >
    <slot>
      {{ $t('pathViewEntryMore.label', { nextPageSize, directoriesLeft }, directoriesLeft) }}
    </slot>
  </icon-button>
</template>
