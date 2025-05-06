<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { VARIANT } from '@/enums/variants.js'

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
const { t } = useI18n()

const toggle = () => {
  active.value = !active.value
}

const variant = computed(() => {
  return active.value ? VARIANT.ACTION : VARIANT.OUTLINE_TERTIARY
})

const { breakpointDown } = useBreakpoints()

const compact = computed(() => {
  return breakpointDown.value[props.compactBreakpoint]
})
</script>

<template>
  <button-icon
    class="button-toggle-filters flex-shrink-0"
    :label="t('buttonToggleFilters.label')"
    :icon-left="PhFunnel"
    :square="compact"
    :hide-label="compact"
    :loading="loading"
    :variant="variant"
    @click="toggle"
  />
</template>
