<script setup>
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { VARIANT } from '@/enums/variants'
defineProps({
  labelKey: { type: String, default: 'global.reset' },
  variant: { type: String, default: VARIANT.OUTLINE_SECONDARY }
})
const { t } = useI18n()
</script>

<template>
  <button-icon icon-left="arrow-counter-clockwise" :variant="variant">{{ t(labelKey) }}</button-icon>
</template>
