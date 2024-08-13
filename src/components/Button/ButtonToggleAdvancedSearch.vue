<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { useBreakpoints } from '@/composables/breakpoints'

const props = defineProps({
  saved: {
    type: Boolean
  },
  loading: {
    type: Boolean
  },
  compactBreakpoint: {
    type: String,
    default: 'md'
  }
})

const { breakpointDown } = useBreakpoints()

const compact = computed(() => {
  return breakpointDown.value[props.compactBreakpoint]
})
</script>

<template>
  <button-icon
    class="button-toggle-advanced-search"
    :label="$t('buttonToggleAdvancedSearch.label')"
    :hide-label="compact"
    :square="compact"
    :loading="loading"
    icon-right="eyeglasses"
    variant="outline-tertiary"
  />
</template>
