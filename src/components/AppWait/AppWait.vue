<script setup>
import { computed } from 'vue'

import { useWait } from '@/composables/useWait'

const props = defineProps({
  /**
   * The tag to use for the component
   */
  tag: {
    type: String,
    default: 'div'
  },
  /**
   * The name of the wait state
   */
  for: {
    type: String,
    required: true
  }
})

const { waiting } = useWait()
const showWaitingSlot = computed(() => waiting(props.for))
</script>

<template>
  <component :is="tag" class="app-wait">
    <slot v-if="showWaitingSlot" name="waiting" />
    <slot v-else />
  </component>
</template>
