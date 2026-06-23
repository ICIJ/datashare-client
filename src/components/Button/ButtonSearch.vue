<script setup>
import { useI18n } from 'vue-i18n'
import { ButtonIcon } from '@icij/murmur'

import IPhMagnifyingGlass from '~icons/ph/magnifying-glass'

import { VARIANT } from '@/enums/variants'
defineProps({
  labelKey: { type: String, default: 'global.search' },
  variant: { type: String, default: VARIANT.ACTION }
})
const { t } = useI18n()
</script>

<template>
  <button-icon
    :icon-right="IPhMagnifyingGlass"
    :variant="variant"
  >
    {{ t(labelKey) }}
  </button-icon>
</template>
