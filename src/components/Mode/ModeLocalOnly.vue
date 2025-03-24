<script setup>
import { computed } from 'vue'

import { useMode } from '@/composables/useMode'

const { strict } = defineProps({
  /**
   * Whether the component should be visible only in local mode and excluding embedded mode.
   *
   * @default false
   */
  strict: {
    type: Boolean,
    default: false
  }
})

const { isLocal: isLocalMode, isEmbedded: isEmbeddedMode } = useMode()
const isVisible = computed(() => isLocalMode.value || (!strict && isEmbeddedMode.value))
</script>

<template>
  <slot v-if="isVisible" />
</template>
