<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { useBreakpoints } from '@/composables/breakpoints'

const active = defineModel('active', { type: Boolean })

const props = defineProps({
  loading: {
    type: Boolean
  },
  compactBreakpoint: {
    type: String,
    default: 'sm'
  }
})

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
    class="button-toggle-filters"
    :label="$t('buttonToggleFilters.label')"
    icon-left="funnel"
    :square="compact"
    :hide-label="compact"
    :loading="loading"
    :variant="variant"
    @click="toggle"
  />
</template>

<style lang="scss" scoped>
.button-toggle-filters.btn-outline-tertiary {
  --bs-btn-color: var(--bs-link-color);
}
</style>
