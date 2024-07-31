<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

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
  <button-icon
    variant="outline-secondary"
    class="document-local-search-nav-item"
    :icon-left="icon"
    :icon-left-weight="iconWeight"
    :label="label"
    :disabled="disabled"
    hide-label
  />
</template>
