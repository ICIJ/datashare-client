<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { VARIANT } from '@/enums/variants'
const props = defineProps({
  active: {
    type: Boolean,
    default: false
  }
})
const { t } = useI18n()
const variant = computed(() => {
  return props.active ? VARIANT.ACTION : VARIANT.OUTLINE_ACTION
})
const label = computed(() => {
  return props.active ? t('buttonToggleBatchMode.labelSingleFlow') : t('buttonToggleBatchMode.labelBatchMode')
})
</script>

<template>
  <button-icon class="button-toggle-batch-mode" :label="label" icon-left="stack" :variant="variant" square hide-label />
</template>
