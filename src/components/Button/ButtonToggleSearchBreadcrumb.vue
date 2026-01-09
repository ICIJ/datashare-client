<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhPath from '~icons/ph/path'

import { VARIANT } from '@/enums/variants.js'
import { ICON_WEIGHT } from '@/enums/iconWeights.js'

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
const { t } = useI18n()

const active = defineModel('active', { type: Boolean })

const toggle = () => {
  active.value = !active.value
}

const nonzeroCounter = computed(() => {
  return props.counter || null
})

const variant = computed(() => {
  return active.value ? VARIANT.ACTION : VARIANT.OUTLINE_TERTIARY
})

const counterVariant = computed(() => {
  return props.disabled ? VARIANT.DARK : VARIANT.ACTION
})

const iconLeftWeight = computed(() => {
  return props.loading ? ICON_WEIGHT.REGULAR : ICON_WEIGHT.FILL
})
</script>

<template>
  <button-icon
    :counter="nonzeroCounter"
    :counter-variant="counterVariant"
    :disabled="disabled"
    :icon-left-weight="iconLeftWeight"
    :icon-left="IPhPath"
    :label="t('buttonToggleSearchBreadcrumb.label')"
    :loading="loading"
    :variant="variant"
    class="button-toggle-search-breadcrumb flex-shrink-0"
    hide-label
    square
    @click="toggle"
  />
</template>
