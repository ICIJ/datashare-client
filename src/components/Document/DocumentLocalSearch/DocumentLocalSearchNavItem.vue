<script setup>
import { computed } from 'vue'
import { ButtonIcon } from '@icij/murmur-next'

const props = defineProps({
  icon: {
    type: [String, Object, Array],
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
