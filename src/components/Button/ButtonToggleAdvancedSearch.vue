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

const active = defineModel('active', { type: Boolean })

const toggle = () => {
  active.value = !active.value
}

const variant = computed(() => {
  return active.value ? 'action' : 'outline-tertiary'
})

const { breakpointDown } = useBreakpoints()

const compact = computed(() => {
  return breakpointDown.value[props.compactBreakpoint]
})
</script>

<template>
  <button-icon
    :hide-label="compact"
    :label="$t('buttonToggleAdvancedSearch.label')"
    :loading="loading"
    :square="compact"
    :variant="variant"
    class="button-toggle-advanced-search"
    icon-right="eyeglasses"
    @click="toggle"
  />
</template>
