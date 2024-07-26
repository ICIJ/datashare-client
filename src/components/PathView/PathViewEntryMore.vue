<script setup>
import { computed, inject } from 'vue'

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
  },
  compact: {
    type: Boolean,
    default: null
  }
})

const nextPageSize = computed(() => {
  return Math.min(props.perPage, props.total - props.page * props.perPage)
})

const directoriesLeft = computed(() => {
  return Math.max(0, props.total - props.page * props.perPage)
})

const compactOrInjected = computed(() => props.compact ?? inject('compact', false))
const size = computed(() => (compactOrInjected.value ? 'sm' : 'md'))
</script>

<template>
  <icon-button
    v-if="directoriesLeft > 0"
    icon-left="caret-down"
    icon-left-variant="primary"
    class="shadow-sm text-nowrap"
    variant="outline-tertiary"
    :size="size"
  >
    <slot>
      {{ $t('pathViewEntryMore.label', { nextPageSize, directoriesLeft }, directoriesLeft) }}
    </slot>
  </icon-button>
</template>
