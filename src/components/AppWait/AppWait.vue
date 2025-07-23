<script setup>
import { computed } from 'vue'

import { useWait } from '@/composables/useWait'
import AppSpinner from '@/components/AppSpinner/AppSpinner'

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
  },
  spinner: {
    type: Boolean,
    default: false
  },
  spinnerClass: {
    type: [String, Object, Array],
    default: 'my-3 mx-auto d-flex'
  }
})

const { waiting } = useWait()
const showWaitingSlot = computed(() => waiting(props.for))
</script>

<template>
  <component :is="tag" class="app-wait">
    <slot v-if="showWaitingSlot" name="waiting">
      <app-spinner v-if="spinner" :class="spinnerClass" />
    </slot>
    <slot v-else />
  </component>
</template>
