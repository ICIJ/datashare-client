<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

const props = defineProps({
  counter: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean
  },
  disabled: {
    type: Boolean
  }
})

const active = defineModel('active', { type: Boolean })

const toggle = () => {
  active.value = !active.value
}

const nonzeroCounter = computed(() => {
  return props.counter || null
})

const variant = computed(() => {
  return active.value ? 'action' : 'outline-dark'
})

const counterVariant = computed(() => {
  return props.disabled ? 'dark' : 'action'
})

const iconLeftWeight = computed(() => {
  return props.loading ? 'regular' : 'fill'
})
</script>

<template>
  <button-icon
    :counter="nonzeroCounter"
    :counter-variant="counterVariant"
    :disabled="disabled"
    :icon-left-weight="iconLeftWeight"
    :label="$t('buttonToggleSearchBreadcrumb.label')"
    :loading="loading"
    :variant="variant"
    class="button-toggle-search-breadcrumb"
    hide-label
    icon-left="path"
    square
    @click="toggle"
  />
</template>
