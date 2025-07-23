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
    default: null
  }
})

const { waiting } = useWait()
const showWaitingSlot = computed(() => waiting(props.for))
const classList = computed(() => ({ 'app-wait--waiting': showWaitingSlot.value }))
</script>

<template>
  <component :is="tag" class="app-wait" :class="classList">
    <slot v-if="showWaitingSlot" name="waiting">
      <app-spinner v-if="spinner" :class="spinnerClass" />
    </slot>
    <slot v-else />
  </component>
</template>

<style lang="scss" scoped>
.app-wait--waiting {
  text-align: center;
}
</style>
