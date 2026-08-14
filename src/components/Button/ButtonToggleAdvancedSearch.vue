<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur'

import IPhEyeglasses from '~icons/ph/eyeglasses'

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
  },
  reduced: {
    type: Boolean
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
  return props.reduced || breakpointDown.value[props.compactBreakpoint]
})
</script>

<template>
  <!-- `pressed` is explicitly undefined so BButton does not treat this as a
       toggle button: in toggle mode it flips its own `pressed` model on every
       click and keeps the resulting `.active` class, which outlives the modal
       and leaves the button looking pressed once it is closed. The pressed
       state is carried by `variant` instead. Murmur's ButtonIcon casts an
       absent `pressed` to false, which is enough to opt into that mode, hence
       the explicit undefined. -->
  <button-icon
    :hide-label="compact"
    :label="t('buttonToggleAdvancedSearch.label')"
    :loading="loading"
    :pressed="undefined"
    :square="compact"
    :variant="variant"
    class="button-toggle-advanced-search"
    :icon-right="IPhEyeglasses"
    @click="toggle"
  />
</template>
