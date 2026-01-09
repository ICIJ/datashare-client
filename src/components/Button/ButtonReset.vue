<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur-next'

import IPhArrowCounterClockwise from '~icons/ph/arrow-counter-clockwise'

import { VARIANT } from '@/enums/variants'
defineProps({
  labelKey: { type: String, default: 'global.reset' },
  variant: { type: String, default: VARIANT.OUTLINE_SECONDARY }
})
const { t } = useI18n()
</script>

<template>
  <button-icon
    :icon-left="IPhArrowCounterClockwise"
    :variant="variant"
  >
    {{ t(labelKey) }}
  </button-icon>
</template>
