<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import { useBreakpoints } from '@/composables/useBreakpoints'
import { VARIANT } from '@/enums/variants.js'

const active = defineModel('active', { type: Boolean })

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
    :hide-label="compact"
    :label="t('buttonToggleAdvancedSearch.label')"
    :loading="loading"
    :square="compact"
    :variant="variant"
    class="button-toggle-advanced-search"
    :icon-right="PhEyeglasses"
    @click="toggle"
  />
</template>
