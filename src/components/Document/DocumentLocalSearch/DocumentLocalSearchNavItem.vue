<script setup>
import { computed } from 'vue'

import IconButton from '@/components/IconButton'

const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  label: {
    type: String
  },
  disabled: {
    type: Boolean
  }
})

const iconWeight = computed(() => {
  return props.disabled ? 'regular' : 'bold'
})
</script>

<template>
  <icon-button
    variant="outline-tertiary"
    class="document-local-search-nav-item"
    :icon-left="icon"
    :icon-left-weight="iconWeight"
    :label="label"
    :disabled="disabled"
    hide-label
  />
</template>
